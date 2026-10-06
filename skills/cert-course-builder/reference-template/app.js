/* cert-course-builder — course engine.
   Certification-agnostic: every course-specific string, number and key comes from course.config.js
   (window.COURSE_CONFIG), data-core.js (BLUEPRINT), the seg*.js files and exam-bank.js. */
(() => {
  'use strict';
  const CFG = Object.assign({ storageKey: 'cert-course-builder-v1', title: 'Exam-prep course', brand: { mark: 'COURSE', name: '' }, meta: '', blueprintLabel: '', videoWindowName: 'courseVideo', disclaimer: '' }, window.COURSE_CONFIG || {});
  const EXAM = Object.assign({ scored: 0, full: { n: 100, minutes: 165 }, half: { n: 50, minutes: 83 }, scaleNote: '' }, CFG.exam || {});
  const KEY = CFG.storageKey;
  const segs = (window.COURSE && window.COURSE.segments) || [];
  const BANK = window.EXAM_BANK || [];
  const BP = window.BLUEPRINT || [];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const LET = 'ABCDEF';

  /* ---------- storage (per-viewer convenience only) ---------- */
  let store = {};
  try { store = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { store = {}; }
  store.seen = store.seen || {}; store.quiz = store.quiz || {}; store.exams = store.exams || []; store.checks = store.checks || {};
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };

  /* ---------- seeded shuffle so option order is stable per question ---------- */
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffled(n, seed) { const r = rng(typeof seed === 'string' ? hash(seed) : seed); const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ---------- flatten course ---------- */
  const flat = [];
  segs.forEach((seg, si) => seg.modules.forEach((mod, mi) => mod.slides.forEach((sl, li) => {
    flat.push({ si, mi, li, seg, mod, sl, key: `${seg.id}:${mod.code}:${li}` });
  })));
  const INTERACTIVE = new Set(['check', 'quiz', 'case', 'exam', 'flash', 'video']);
  let cur = Math.min(Math.max(0, store.cur | 0), Math.max(0, flat.length - 1));
  let autoplay = false;

  /* ---------- rail ---------- */
  function buildRail() {
    let h = '';
    segs.forEach((seg, si) => {
      h += `<section class="r-seg" style="--hue:var(--${seg.hue})"><div class="r-seg-head"><span class="r-code">${seg.code}</span><span class="r-seg-title">${seg.title}</span>${seg.q ? `<span class="r-q">${seg.q}</span>` : ''}</div><ol class="r-mods">`;
      seg.modules.forEach((mod, mi) => {
        const start = flat.findIndex(f => f.si === si && f.mi === mi);
        h += `<li><button class="r-mod" data-go="${start}" data-mod="${si}-${mi}"><span class="r-mcode">${mod.code}</span><span class="r-mtitle">${mod.title}</span><span class="r-mprog" id="rp-${si}-${mi}"></span></button></li>`;
      });
      h += '</ol></section>';
    });
    $('#railNav').innerHTML = h;
    $$('#railNav .r-mod').forEach(b => b.addEventListener('click', () => { go(+b.dataset.go); closeRail(); }));
  }
  function updateRail() {
    const f = flat[cur];
    $$('#railNav .r-mod').forEach(b => {
      const [si, mi] = b.dataset.mod.split('-').map(Number);
      const on = si === f.si && mi === f.mi;
      b.classList.toggle('on', on);
      if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      const slides = flat.filter(x => x.si === si && x.mi === mi);
      const seen = slides.filter(x => store.seen[x.key]).length;
      const el = $('#rp-' + si + '-' + mi);
      el.textContent = seen === slides.length ? '✓ done' : `${seen}/${slides.length}`;
      el.classList.toggle('done', seen === slides.length);
    });
    const onBtn = $('#railNav .r-mod.on');
    const railBox = $('#rail');
    if (onBtn && railBox && !isNarrow()) {
      const top = onBtn.offsetTop - railBox.offsetTop, bot = top + onBtn.offsetHeight;
      if (top < railBox.scrollTop) railBox.scrollTop = Math.max(0, top - 12);
      else if (bot > railBox.scrollTop + railBox.clientHeight) railBox.scrollTop = bot - railBox.clientHeight + 12;
    }
  }
  function updateProgress() {
    const n = flat.filter(f => store.seen[f.key]).length;
    const pct = flat.length ? Math.round(n / flat.length * 100) : 0;
    $('#progFill').style.width = pct + '%';
    $('#progTxt').textContent = pct + '% viewed';
  }
  const isNarrow = () => window.matchMedia('(max-width:900px)').matches;
  function openRail() { $('#app').classList.add('rail-open'); $('#mapBtn').setAttribute('aria-expanded', 'true'); if (!$('.scrim')) { const s = document.createElement('div'); s.className = 'scrim'; s.addEventListener('click', closeRail); document.body.appendChild(s); } }
  function closeRail() { $('#app').classList.remove('rail-open'); $('#mapBtn').setAttribute('aria-expanded', 'false'); const s = $('.scrim'); if (s) s.remove(); }

  /* ---------- slide renderers ---------- */
  function renderSlide(f) {
    const s = f.sl, t = s.type || 'content';
    const kick = s.kicker ? `<p class="s-kicker">${s.kicker}</p>` : '';
    if (t === 'opener') return renderOpener(f);
    if (t === 'blueprint') return `${kick}<h2 class="s-title">${s.title}</h2><div class="s-body">${s.before || ''}${blueprintSVG()}${s.after || ''}</div>`;
    if (t === 'check') return `<p class="s-kicker">Knowledge check${s.code ? ' · ' + s.code : ''}</p><h2 class="s-title">${s.title || 'Apply it'}</h2><div class="check-root"></div>`;
    if (t === 'quiz') return `<p class="s-kicker">${s.kicker || 'Module quiz'}</p><h2 class="s-title">${s.title}</h2><div class="quiz-root"></div>`;
    if (t === 'video') return renderVideo(s);
    if (t === 'case') return renderCase(s);
    if (t === 'flash') return `${kick || '<p class="s-kicker">Flashcards</p>'}<h2 class="s-title">${s.title}</h2><div class="flash-root"></div>`;
    if (t === 'exam') return `<p class="s-kicker">Mock exam</p><h2 class="s-title">${s.title}</h2><div class="s-body">${s.html || ''}<div class="exam-root"></div></div>`;
    return `${kick}<h2 class="s-title">${s.title}</h2><div class="s-body">${s.html || ''}</div>`;
  }
  function renderOpener(f) {
    const s = f.sl, seg = f.seg;
    const bp = BP.find(d => d.d === seg.code);
    const table = bp ? `<div class="tbl"><table><thead><tr><th>Blueprint code</th><th>Competency</th><th>Scored questions</th></tr></thead><tbody>${bp.comps.map(c => `<tr><td class="num">${c[0]}</td><td>${c[1]}</td><td class="num">${c[3]}–${c[4]}</td></tr>`).join('')}</tbody></table></div>` : '';
    return `<div class="opener"><div class="op-code" aria-hidden="true">${seg.code}</div><div class="op-main"><p class="op-eyebrow">${s.eyebrow || seg.label}</p><h2 class="op-title">${s.title}</h2>${bp ? `<span class="op-plate">${bp.min}–${bp.max}${EXAM.scored ? ' of ' + EXAM.scored : ''} scored questions</span>` : ''}</div>${s.lede ? `<p class="op-lede" style="grid-column:1/-1">${s.lede}</p>` : ''}${table}${s.html ? `<div class="op-extra s-body">${s.html}</div>` : ''}</div>`;
  }
  function renderVideo(s) {
    return `<p class="s-kicker">${H.ic('play')}Watch · external video</p><h2 class="s-title">${s.title}</h2>
    <div class="video">
      <div class="v-frame" data-vid="${s.id}" role="button" tabindex="0" aria-label="Open the video in a pop-out player" style="cursor:pointer"><div class="v-poster"><span class="v-play" aria-hidden="true"></span><p class="v-chan">${s.channel} · YouTube</p><p class="v-title">${s.vtitle}</p></div></div>
      <div class="v-actions"><button class="btn primary" data-pop>Open pop-out player</button><a class="btn" href="https://www.youtube.com/watch?v=${s.id}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a><span class="v-note">This viewer blocks embedded players, so videos open in their own window.</span></div>
      <div class="cols"><div><h3 class="s-kicker" style="margin:0">Why this video</h3><p style="margin:0">${s.why}</p></div><div><h3 class="s-kicker" style="margin:0">Watch for</h3><div class="s-body">${H.ul(s.watch)}</div></div></div>
      ${s.sum ? `<div class="v-sum s-body"><h3 class="s-kicker" style="margin:0">${H.ic('book')}Key ideas, if you can’t watch now</h3>${H.ul(s.sum)}</div>` : ''}
      ${s.after ? `<div class="s-body">${s.after}</div>` : ''}
    </div>`;
  }
  function renderCase(s) {
    return `<p class="s-kicker">Case study${s.code ? ' · ' + s.code : ''}</p><h2 class="s-title">${s.title}</h2>
    <div class="case"><div class="scenario"><p class="sc-l">Scenario</p>${s.scenario}</div>
    <div class="prompts">${s.prompts.map((p, i) => `<details class="prompt"><summary><span class="p-n">Q${i + 1}</span><span>${p.q}</span><span class="p-hint">Decide first, then open the model answer</span></summary><div class="p-a">${p.a}</div></details>`).join('')}</div></div>`;
  }

  /* blueprint range chart — drawn from BLUEPRINT to one scale */
  function blueprintSVG() {
    const maxHi = Math.max(2, ...BP.flatMap(d => d.comps.map(c => c[4])));
    const W = 780, left = 250, right = 70, top = 34, rowH = 30, gap = 18, max = Math.ceil(maxHi / 2) * 2;
    const x = v => left + (W - left - right) * v / max;
    let rows = 0; BP.forEach(d => rows += d.comps.length);
    const H = top + rows * rowH + BP.length * gap + 30;
    let y = top, out = '';
    for (let v = 0; v <= max; v += 2) {
      out += `<line x1="${x(v)}" x2="${x(v)}" y1="${top - 8}" y2="${H - 24}" class="s-rule" stroke-width="1"/>`;
      out += `<text x="${x(v)}" y="${H - 8}" text-anchor="middle" class="t-sm t-mute mono">${v}</text>`;
    }
    out += `<text x="${x(max)}" y="${top - 16}" text-anchor="end" class="t-sm t-mute">scored questions per competency</text>`;
    BP.forEach(d => {
      y += gap * 0.2;
      d.comps.forEach(c => {
        const cy = y + rowH / 2;
        out += `<text x="12" y="${cy + 4}" class="t-md mono t-${d.hue}" font-weight="600">${c[0]}</text>`;
        out += `<text x="64" y="${cy + 4}" class="t-md">${c[2]}</text>`;
        out += `<rect x="${x(c[3])}" y="${cy - 7}" width="${x(c[4]) - x(c[3])}" height="14" rx="2" class="f-${d.hue}"/>`;
        out += `<text x="${x(c[4]) + 8}" y="${cy + 4}" class="t-sm mono t-2">${c[3]}–${c[4]}</text>`;
        y += rowH;
      });
      y += gap * 0.8;
    });
    const all = BP.flatMap(d => d.comps.map(c => ({ code: c[0], lo: c[3], hi: c[4] })));
    const top2 = [...all].sort((a, b) => b.hi - a.hi || b.lo - a.lo).slice(0, 2);
    const heavy = top2.length > 1 ? ` The heaviest single competencies are ${top2[0].code} (${top2[0].lo}–${top2[0].hi}) and ${top2[1].code} (${top2[1].lo}–${top2[1].hi}).` : '';
    return `<figure class="fig"><div class="svgwrap"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Blueprint: question range for each of the ${all.length} competencies">${out}</svg></div><figcaption>Each bar spans the minimum–maximum number of scored questions for that competency${CFG.blueprintLabel ? ' (' + CFG.blueprintLabel + ')' : ''}.${heavy}</figcaption></figure>`;
  }

  /* ---------- mounting interactive parts ---------- */
  function mount(f, root) {
    const s = f.sl, t = s.type || 'content';
    if (t === 'check') mountCheck(root.querySelector('.check-root'), s, f.key);
    if (t === 'quiz') mountQuiz(root.querySelector('.quiz-root'), s.items, s.id || f.key, s.intro);
    if (t === 'flash') mountFlash(root.querySelector('.flash-root'), s.cards, f.key);
    if (t === 'exam') mountLauncher(root.querySelector('.exam-root'));
    if (t === 'video') {
      const open = () => {
        const w = window.open(`https://www.youtube.com/watch?v=${s.id}`, CFG.videoWindowName, 'popup=yes,width=1040,height=660');
        if (!w) toast('Pop-up windows are blocked here — use “Watch on YouTube”.');
        narrator.pause();
      };
      root.querySelector('[data-pop]').addEventListener('click', open);
      const fr = root.querySelector('.v-frame');
      fr.addEventListener('click', open);
      fr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    }
  }

  function optionButtons(q, order) {
    return order.map((oi, pos) => `<button class="opt" data-oi="${oi}"><span class="opt-l">${LET[pos]}</span><span class="opt-t">${q.opts[oi]}</span><span class="opt-m"></span></button>`).join('');
  }
  function markOptions(root, q, chosen) {
    $$('.opt', root).forEach(x => {
      x.disabled = true;
      const oi = +x.dataset.oi;
      if (oi === q.a) { x.classList.add('correct'); x.querySelector('.opt-m').textContent = '✓ Correct answer'; }
      else if (oi === chosen) { x.classList.add('wrong'); x.querySelector('.opt-m').textContent = '✗ Your answer'; }
    });
  }

  function mountCheck(root, s, key) {
    const order = shuffled(s.opts.length, key);
    root.innerHTML = `<p class="q-stem">${s.q}</p><div class="opts">${optionButtons(s, order)}</div><div class="why" hidden></div>`;
    const answer = (oi) => {
      markOptions(root, s, oi);
      const ok = oi === s.a;
      const w = root.querySelector('.why'); w.hidden = false;
      w.innerHTML = `<p class="why-h ${ok ? 'ok' : 'bad'}">${ok ? '✓ Correct' : '✗ Not quite'}</p><p>${s.why}</p>`;
      store.checks[key] = ok ? 1 : 0; save();
    };
    $$('.opt', root).forEach(b => b.addEventListener('click', () => answer(+b.dataset.oi)));
  }

  function mountQuiz(root, items, id, intro) {
    let i = 0, score = 0; const picks = [];
    const qs = items.map((q, k) => ({ ...q, order: shuffled(q.opts.length, id + ':' + k) }));
    function start() {
      const prev = store.quiz[id];
      root.innerHTML = `<div class="qz-intro">${intro ? `<p class="lede">${intro}</p>` : ''}<p class="mono" style="color:var(--ink-3)">${qs.length} questions · instant feedback with explanations${prev ? ` · your best so far: ${prev.best}/${prev.total}` : ''}</p><button class="btn primary" data-start>${prev ? 'Retake quiz' : 'Start quiz'}</button></div>`;
      root.querySelector('[data-start]').addEventListener('click', () => { i = 0; score = 0; picks.length = 0; showQ(); tts.pause(); });
    }
    function showQ() {
      const q = qs[i];
      root.innerHTML = `<div class="qz-top"><span>Question ${i + 1} of ${qs.length}</span>${q.code ? `<span class="chip">${q.code}</span>` : ''}<span class="qz-score">Score ${score}/${i}</span></div><div class="qz-bar"><span style="width:${(i / qs.length) * 100}%"></span></div><p class="q-stem">${q.q}</p><div class="opts">${optionButtons(q, q.order)}</div><div class="why" hidden></div><div class="qz-nav" hidden><button class="btn primary" data-next>${i < qs.length - 1 ? 'Next question →' : 'See results'}</button></div>`;
      $$('.opt', root).forEach(b => b.addEventListener('click', () => answer(+b.dataset.oi)));
      const first = root.querySelector('.opt'); if (first) first.focus({ preventScroll: true });
    }
    function answer(oi) {
      const q = qs[i]; const ok = oi === q.a; if (ok) score++; picks[i] = oi;
      markOptions(root, q, oi);
      const w = root.querySelector('.why'); w.hidden = false;
      w.innerHTML = `<p class="why-h ${ok ? 'ok' : 'bad'}">${ok ? '✓ Correct' : '✗ Not quite'}</p><p>${q.why}</p>`;
      root.querySelector('.qz-score').textContent = `Score ${score}/${i + 1}`;
      const nav = root.querySelector('.qz-nav'); nav.hidden = false;
      const nb = root.querySelector('[data-next]'); nb.focus({ preventScroll: true });
      nb.addEventListener('click', () => { i++; if (i < qs.length) { showQ(); $('#stageScroll').scrollTop = 0; } else results(); });
    }
    function results() {
      const best = Math.max(score, (store.quiz[id] && store.quiz[id].best) || 0);
      store.quiz[id] = { score, total: qs.length, best }; save();
      const pct = Math.round(score / qs.length * 100);
      const verdict = pct >= 80 ? 'Exam-ready on this material.' : pct >= 65 ? 'Close. Re-read the explanations for the ones you missed, then retake.' : 'Revisit this module’s slides before moving on — the explanations below show where the reasoning slipped.';
      root.innerHTML = `<div class="qz-intro"><div class="result-big">${score}/${qs.length}</div><p class="lede">${pct}% — ${verdict}</p><div class="qz-nav" style="margin:0"><button class="btn primary" data-retake>Retake quiz</button><button class="btn" data-onward>Continue course →</button></div></div>
      <h3 class="s-kicker" style="margin-top:26px">Review</h3><div class="review">${qs.map((q, k) => { const ok = picks[k] === q.a; return `<div class="rv"><p class="rv-h"><span class="${ok ? 'ok' : 'bad'}">${ok ? '✓ Correct' : '✗ Missed'}</span>${q.code ? `<span>${q.code}</span>` : ''}<span>Q${k + 1}</span></p><p class="rv-q">${q.q}</p>${ok ? '' : `<p class="rv-a">You chose: ${q.opts[picks[k]]}</p>`}<p class="rv-a"><b>Answer:</b> ${q.opts[q.a]}</p><p class="rv-a">${q.why}</p></div>`; }).join('')}</div>`;
      root.querySelector('[data-retake]').addEventListener('click', () => { i = 0; score = 0; picks.length = 0; showQ(); $('#stageScroll').scrollTop = 0; });
      root.querySelector('[data-onward]').addEventListener('click', () => go(cur + 1));
    }
    start();
  }

  function mountFlash(root, cards, key) {
    let order = [...cards.keys()], i = 0, back = false;
    function draw() {
      const c = cards[order[i]];
      root.innerHTML = `<div class="flash"><button class="card${back ? ' back' : ''}" data-flip aria-live="polite"><span><span class="cf-l">${back ? 'Answer' : 'Term / prompt'}</span>${back ? c[1] : c[0]}</span></button>
      <div class="flash-ctl"><button class="btn" data-p>← Prev</button><span>${i + 1} / ${cards.length}</span><button class="btn" data-f>${back ? 'Show prompt' : 'Flip card'}</button><button class="btn" data-n>Next →</button><button class="btn ghost" data-s>Shuffle</button></div><p class="v-note">Click the card or press F to flip.</p></div>`;
      root.querySelector('[data-flip]').addEventListener('click', flip);
      root.querySelector('[data-f]').addEventListener('click', flip);
      root.querySelector('[data-p]').addEventListener('click', () => { i = (i - 1 + cards.length) % cards.length; back = false; draw(); });
      root.querySelector('[data-n]').addEventListener('click', () => { i = (i + 1) % cards.length; back = false; draw(); });
      root.querySelector('[data-s]').addEventListener('click', () => { order = shuffled(cards.length, Date.now()); i = 0; back = false; draw(); });
    }
    function flip() { back = !back; draw(); root.querySelector('[data-flip]').focus({ preventScroll: true }); }
    root._flip = flip;
    draw();
  }

  /* ---------- exam launcher + overlay ---------- */
  const MODES = {
    full: { label: 'Full mock exam', n: EXAM.full.n, min: EXAM.full.minutes, feedback: false },
    half: { label: 'Half-length mock', n: EXAM.half.n, min: EXAM.half.minutes, feedback: false }
  };
  BP.forEach(d => { MODES[d.d] = { label: `Domain ${d.d} drill`, dom: d.d, feedback: true }; });
  const DOMS = BP.map(d => d.d);
  const fmtMin = m => m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}` : `${m} min`;
  let EX = null, exTimer = null;

  function mountLauncher(root) {
    const count = d => BANK.filter(q => q.d === d).length;
    const hist = store.exams.slice(-5).reverse();
    root.innerHTML = `
    ${EX && !EX.done ? `<div class="co tip"><p class="co-l">Exam in progress</p><p>You left a ${MODES[EX.mode].label.toLowerCase()} running. <button class="btn primary" data-resume style="margin-left:8px">Resume</button></p></div>` : ''}
    <div class="launch">
      <div class="launch-card"><h3>Full mock exam</h3><p class="meta">${Math.min(EXAM.full.n, BANK.length)} questions · ${fmtMin(EXAM.full.minutes)} timer</p><p>Mirrors exam day: domains interleaved, no feedback until you submit, flag-for-review navigator.</p><button class="btn primary" data-mode="full">Start full exam</button></div>
      <div class="launch-card"><h3>Half-length mock</h3><p class="meta">${Math.min(EXAM.half.n, BANK.length)} questions · ${fmtMin(EXAM.half.minutes)} timer</p><p>A stratified sample across every domain — good for a short study session.</p><button class="btn" data-mode="half">Start half exam</button></div>
      <div class="launch-card"><h3>Domain drills</h3><p class="meta">Untimed · instant feedback</p><p>Every bank question for one domain, with explanations as you go.</p><div class="ctl-group">${DOMS.map(d => `<button class="btn" data-mode="${d}">${d} · ${count(d)}</button>`).join('')}</div></div>
    </div>
    ${hist.length ? `<div class="hist"><h3 class="s-kicker" style="margin:10px 0 6px">Your recent attempts (this browser)</h3>${H.tbl(['Date', 'Mode', 'Score', ...DOMS], hist.map(h => [new Date(h.at).toLocaleDateString(), MODES[h.mode] ? MODES[h.mode].label : h.mode, `<span class="num">${h.pct}%</span>`, ...DOMS.map(d => h.by[d] != null ? `<span class="num">${h.by[d]}%</span>` : '—')]))}</div>` : ''}`;
    $$('[data-mode]', root).forEach(b => b.addEventListener('click', () => examStart(b.dataset.mode)));
    const r = root.querySelector('[data-resume]'); if (r) r.addEventListener('click', () => examShow());
  }

  function examStart(mode) {
    tts.stop();
    const M = MODES[mode];
    let pool;
    const seed = Date.now();
    if (M.dom) pool = BANK.filter(q => q.d === M.dom);
    else if (mode === 'half') {
      pool = [];
      DOMS.forEach((d, k) => {
        const dq = BANK.filter(q => q.d === d); const ord = shuffled(dq.length, seed + k);
        const take = Math.round(dq.length * M.n / BANK.length);
        ord.slice(0, take).forEach(ix => pool.push(dq[ix]));
      });
    } else pool = BANK.slice(0, M.n);
    const qord = shuffled(pool.length, seed + 99);
    const qs = qord.map(ix => pool[ix]).map((q, k) => ({ ...q, order: shuffled(q.opts.length, seed + ':' + k) }));
    EX = { mode, qs, ans: Array(qs.length).fill(null), flag: Array(qs.length).fill(false), i: 0, start: Date.now(), limit: M.min ? M.min * 60 : 0, done: false, feedback: M.feedback };
    examShow();
  }
  function examShow() {
    const ov = $('#exam'); ov.hidden = false; document.body.style.overflow = 'hidden';
    ov.innerHTML = `<header class="ex-head"><span class="ex-title">${MODES[EX.mode].label}</span><span class="ex-timer" id="exTimer">${EX.limit ? '' : 'Untimed'}</span><span class="ex-count" id="exCount"></span><span class="spacer"></span><button class="btn" id="exLeave">Back to course</button><button class="btn primary" id="exSubmit">Submit</button></header><div class="ex-body" id="exBody"><div class="ex-grid"><section class="ex-q" id="exQ"></section><aside class="ex-nav" id="exNav"></aside></div></div>`;
    $('#exLeave').addEventListener('click', examHide);
    $('#exSubmit').addEventListener('click', examConfirm);
    if (EX.limit) { clearInterval(exTimer); exTimer = setInterval(tick, 1000); tick(); }
    examDraw();
  }
  function examHide() { $('#exam').hidden = true; document.body.style.overflow = ''; clearInterval(exTimer); go(cur); }
  function remaining() { return EX.limit - Math.floor((Date.now() - EX.start) / 1000); }
  function fmt(s) { s = Math.max(0, s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0'); }
  function tick() {
    if (!EX || EX.done) return;
    const r = remaining(); const el = $('#exTimer'); if (!el) return;
    el.textContent = fmt(r) + ' left'; el.classList.toggle('low', r < 600);
    if (r <= 0) { clearInterval(exTimer); examSubmit(true); }
  }
  function examDraw() {
    const q = EX.qs[EX.i], n = EX.qs.length, answered = EX.ans.filter(a => a !== null).length;
    $('#exCount').textContent = `Question ${EX.i + 1} of ${n} · ${answered} answered · ${EX.flag.filter(Boolean).length} flagged`;
    const locked = EX.feedback && EX.ans[EX.i] !== null;
    $('#exQ').innerHTML = `<div class="qz-top"><span>Question ${EX.i + 1}</span><span class="chip">${q.c}</span>${q.tag ? `<span class="chip">${q.tag}</span>` : ''}</div><p class="q-stem">${q.q}</p><div class="opts">${optionButtons(q, q.order)}</div><div class="why" hidden></div>
      <div class="ex-foot"><button class="btn" id="exPrev" ${EX.i === 0 ? 'disabled' : ''}>← Previous</button><button class="btn" id="exFlag" aria-pressed="${EX.flag[EX.i]}">${EX.flag[EX.i] ? 'Flagged for review' : 'Flag for review'}</button><button class="btn primary" id="exNext">${EX.i === n - 1 ? 'Review & submit' : 'Next →'}</button></div><div id="exConfirm"></div>`;
    $$('#exQ .opt').forEach(b => {
      const oi = +b.dataset.oi;
      if (EX.ans[EX.i] === oi) b.classList.add('sel');
      b.addEventListener('click', () => {
        if (EX.feedback && EX.ans[EX.i] !== null) return;
        EX.ans[EX.i] = oi; $$('#exQ .opt').forEach(x => x.classList.toggle('sel', +x.dataset.oi === oi));
        if (EX.feedback) showFeedback(); drawNav();
        $('#exCount').textContent = `Question ${EX.i + 1} of ${n} · ${EX.ans.filter(a => a !== null).length} answered · ${EX.flag.filter(Boolean).length} flagged`;
      });
    });
    if (locked) showFeedback();
    $('#exPrev').addEventListener('click', () => { EX.i--; examDraw(); });
    $('#exNext').addEventListener('click', () => { if (EX.i < n - 1) { EX.i++; examDraw(); } else examConfirm(); });
    $('#exFlag').addEventListener('click', () => { EX.flag[EX.i] = !EX.flag[EX.i]; examDraw(); });
    drawNav();
    $('#exBody').scrollTop = 0;
  }
  function showFeedback() {
    const q = EX.qs[EX.i], chosen = EX.ans[EX.i];
    $$('#exQ .opt').forEach(x => x.classList.remove('sel'));
    markOptions($('#exQ'), q, chosen);
    const w = $('#exQ .why'); w.hidden = false; const ok = chosen === q.a;
    w.innerHTML = `<p class="why-h ${ok ? 'ok' : 'bad'}">${ok ? '✓ Correct' : '✗ Not quite'}</p><p>${q.why}</p>`;
  }
  function drawNav() {
    const nav = $('#exNav'); if (!nav) return;
    nav.innerHTML = `<p class="s-kicker" style="margin:0">Navigator</p><div class="ex-cells">${EX.qs.map((q, k) => { let c = 'ex-cell'; if (EX.done) c += EX.ans[k] === q.a ? ' r-ok' : ' r-bad'; else if (EX.ans[k] !== null) c += ' ans'; if (EX.flag[k]) c += ' flag'; if (k === EX.i && !EX.done) c += ' cur'; return `<button class="${c}" data-k="${k}" aria-label="Question ${k + 1}${EX.ans[k] !== null ? ', answered' : ''}${EX.flag[k] ? ', flagged' : ''}">${k + 1}</button>`; }).join('')}</div><div class="ex-key"><span><i style="background:var(--surface-3)"></i>answered</span><span><i style="border-color:var(--tip);background:var(--tip)"></i>flagged</span><span><i style="border-color:var(--accent)"></i>current</span></div>`;
    $$('.ex-cell', nav).forEach(b => b.addEventListener('click', () => { const k = +b.dataset.k; if (EX.done) { const el = document.getElementById('rv-' + k); if (el) el.scrollIntoView({ block: 'start' }); } else { EX.i = k; examDraw(); } }));
  }
  function examConfirm() {
    const un = EX.ans.filter(a => a === null).length, fl = EX.flag.filter(Boolean).length;
    const box = $('#exConfirm'); if (!box) return;
    box.innerHTML = `<div class="confirm"><p><b>Submit now?</b> ${un ? `${un} question${un > 1 ? 's are' : ' is'} unanswered — unanswered questions score zero, so answer everything.` : 'All questions answered.'}${fl ? ` ${fl} flagged for review.` : ''}</p><div class="ctl-group"><button class="btn primary" id="exYes">Submit and score</button><button class="btn" id="exNo">Keep working</button></div></div>`;
    $('#exYes').addEventListener('click', () => examSubmit(false));
    $('#exNo').addEventListener('click', () => { box.innerHTML = ''; });
    box.scrollIntoView({ block: 'nearest' });
  }
  function examSubmit(timeUp) {
    clearInterval(exTimer);
    EX.done = true;
    const n = EX.qs.length; let right = 0; const by = {}, byC = {};
    EX.qs.forEach((q, k) => { const ok = EX.ans[k] === q.a; if (ok) right++; (by[q.d] = by[q.d] || [0, 0]); by[q.d][1]++; if (ok) by[q.d][0]++; (byC[q.c] = byC[q.c] || [0, 0]); byC[q.c][1]++; if (ok) byC[q.c][0]++; });
    const pct = Math.round(right / n * 100);
    const byPct = {}; Object.keys(by).forEach(d => byPct[d] = Math.round(by[d][0] / by[d][1] * 100));
    store.exams.push({ at: Date.now(), mode: EX.mode, pct, by: byPct }); save();
    const used = Math.floor((Date.now() - EX.start) / 1000);
    const band = pct >= 80 ? ['Strong', 'You are answering like a working practitioner. Keep sharp with a second full mock in a few days.'] : pct >= 70 ? ['Borderline-ready', 'Target the weakest competencies below, then take the other mock length.'] : ['Not yet', 'Work through the domain drills for your two weakest domains before another full attempt.'];
    const doms = DOMS.filter(d => by[d]);
    const comps = Object.keys(byC).sort((a, b) => (byC[a][0] / byC[a][1]) - (byC[b][0] / byC[b][1]));
    $('#exTimer').textContent = 'Submitted'; $('#exTimer').classList.remove('low');
    $('#exCount').textContent = `${right} of ${n} correct${timeUp ? ' · time expired' : ''} · ${fmt(used)} used`;
    $('#exSubmit').hidden = true;
    $('#exQ').innerHTML = `<p class="s-kicker">Result</p><div class="result-big" style="color:var(--accent)">${pct}%</div><p class="lede"><b>${band[0]}.</b> ${band[1]}</p>
      ${EXAM.scaleNote ? `<p class="v-note">${EXAM.scaleNote}</p>` : ''}
      <h3 class="s-kicker" style="margin-top:22px">By domain</h3><div class="dbars">${doms.map(d => { const b = BP.find(x => x.d === d); return `<div class="dbar" style="--hue:var(--${b.hue})"><span><b>Domain ${d}</b></span><span class="track" title="75% line marked"><span style="width:${byPct[d]}%"></span><i></i></span><span class="num">${by[d][0]}/${by[d][1]} · ${byPct[d]}%</span></div>`; }).join('')}</div>
      <h3 class="s-kicker" style="margin-top:22px">By competency — weakest first</h3>${H.tbl(['Competency', 'Correct', 'Study next'], comps.map(c => { const pc = Math.round(byC[c][0] / byC[c][1] * 100); const mod = findModule(c); return [`<span class="num">${c}</span>`, `<span class="num">${byC[c][0]}/${byC[c][1]} · ${pc}%</span>`, mod ? `<button class="btn" data-study="${mod}">Open ${c} module</button>` : '—']; }))}
      <h3 class="s-kicker" style="margin-top:26px">Answer review</h3><div class="filters"><button class="btn" data-f="all" aria-pressed="true">All</button><button class="btn" data-f="bad" aria-pressed="false">Missed only</button><button class="btn" data-f="flag" aria-pressed="false">Flagged only</button></div>
      <div class="review" id="exReview">${EX.qs.map((q, k) => { const ok = EX.ans[k] === q.a; return `<div class="rv" id="rv-${k}" data-ok="${ok ? 1 : 0}" data-flag="${EX.flag[k] ? 1 : 0}"><p class="rv-h"><span class="${ok ? 'ok' : 'bad'}">${ok ? '✓ Correct' : '✗ Missed'}</span><span>Q${k + 1}</span><span>${q.c}</span>${EX.flag[k] ? '<span>flagged</span>' : ''}</p><p class="rv-q">${q.q}</p>${ok ? '' : `<p class="rv-a">You chose: ${EX.ans[k] === null ? '<i>no answer</i>' : q.opts[EX.ans[k]]}</p>`}<p class="rv-a"><b>Answer:</b> ${q.opts[q.a]}</p><p class="rv-a">${q.why}</p></div>`; }).join('')}</div>
      <div class="ex-foot"><button class="btn primary" id="exBack">Back to course</button><button class="btn" id="exAgain">New attempt, same mode</button></div>`;
    $$('#exQ [data-f]').forEach(b => b.addEventListener('click', () => {
      $$('#exQ [data-f]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      $$('#exReview .rv').forEach(r => { r.hidden = b.dataset.f === 'bad' ? r.dataset.ok === '1' : b.dataset.f === 'flag' ? r.dataset.flag !== '1' : false; });
    }));
    $$('#exQ [data-study]').forEach(b => b.addEventListener('click', () => { $('#exam').hidden = true; document.body.style.overflow = ''; go(+b.dataset.study); }));
    $('#exBack').addEventListener('click', examHide);
    $('#exAgain').addEventListener('click', () => examStart(EX.mode));
    drawNav();
    $('#exBody').scrollTop = 0;
  }
  function findModule(code) {
    const k = flat.findIndex(f => f.mod.code === code);
    return k >= 0 ? k : null;
  }

  /* ---------- narration: recorded natural voices, with device speech as fallback ---------- */
  const AM = window.AUDIO_MANIFEST || null;
  const canOpus = (() => { try { const a = document.createElement('audio'); return !!(a.canPlayType && a.canPlayType('audio/webm; codecs="opus"')); } catch (e) { return false; } })();
  const narrator = (() => {
    const synthOK = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    const natural = (AM && canOpus) ? AM.voices : [];
    const btn = $('#listenBtn'), lbl = $('#listenLbl'), vsel = $('#voiceSel'), rsel = $('#rateSel');
    const audio = new Audio(); audio.preload = 'auto';
    let sents = [], idx = 0, token = 0, playing = false, rate = +(store.rate || 1), key = '', text = '', item = null, warned = false;
    let choice = store.voice2 || (natural.length ? 'n:' + natural[0].id : 'd:');
    if (choice.startsWith('n:') && !natural.find(v => 'n:' + v.id === choice)) choice = natural.length ? 'n:' + natural[0].id : 'd:';
    let dvoice = null, dlist = [];
    rsel.value = String(rate); if (!rsel.value) { rsel.value = '1'; rate = 1; }
    const split = t => t ? t.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+(?=[A-Z0-9"'(“‘])/) : [];
    const mode = () => choice.startsWith('n:') ? 'n' : 'd';
    function populate() {
      dlist = synthOK ? speechSynthesis.getVoices().filter(v => /^en(-|_|$)/i.test(v.lang)) : [];
      const rank = v => (/natural|online|neural/i.test(v.name) ? 0 : /google/i.test(v.name) ? 1 : 2);
      dlist.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
      const q = x => x.replace(/"/g, '&quot;');
      vsel.innerHTML = (natural.length ? `<optgroup label="Natural voices (recorded)">${natural.map(v => `<option value="n:${v.id}">${v.label}</option>`).join('')}</optgroup>` : '')
        + `<optgroup label="Device voices">${dlist.length ? dlist.map(v => `<option value="d:${q(v.name)}">${v.name.replace(/Microsoft |Google /, '')} (${v.lang})</option>`).join('') : '<option value="d:">Default device voice</option>'}</optgroup>`;
      if (![...vsel.options].some(o => o.value === choice)) choice = natural.length ? 'n:' + natural[0].id : (dlist[0] ? 'd:' + dlist[0].name : 'd:');
      vsel.value = choice;
      dvoice = dlist.find(v => 'd:' + v.name === choice) || dlist[0] || null;
    }
    function resolveItem() {
      item = null;
      if (mode() !== 'n' || !AM) return;
      const it = (AM.items[choice.slice(2)] || {})[key];
      if (it && it.h === hash(text).toString(36)) item = it;
    }
    const usingAudio = () => !!item;
    function ui() {
      btn.classList.toggle('playing', playing);
      const paused = usingAudio() ? (audio.dataset.path === srcOf(item) && audio.currentTime > item.o + 0.05 && audio.currentTime < item.o + item.d - 0.05) : idx > 0;
      lbl.textContent = playing ? 'Pause' : (paused ? 'Resume' : 'Listen');
      btn.disabled = !sents.length || (!usingAudio() && !synthOK);
      btn.title = usingAudio() ? 'Recorded natural narration' : (synthOK ? 'Device voice' : 'Narration is unavailable in this browser — the transcript has the full script.');
    }
    function inner() { /* narration never scrolls: the view stays on the slide */ }
    function hl(i) { if (i === idx && $('#txBody span.now')) return; idx = Math.max(0, i); $$('#txBody span').forEach((s, k) => s.classList.toggle('now', k === i)); if (playing) inner($('#txBody span.now')); }
    function seek(sec) { if (audio.readyState >= 1) audio.currentTime = sec; else audio.addEventListener('loadedmetadata', () => { audio.currentTime = sec; }, { once: true }); }
    const srcOf = it => `${AM.base}${it.m}.webm`;
    const blobs = new Map(); const blobOrder = [];
    function ensureSrc(path) {
      if (blobs.has(path)) return blobs.get(path);
      const p = fetch(path).then(r => { if (!r.ok) throw new Error('http ' + r.status); return r.blob(); })
        .then(bl => { const u = URL.createObjectURL(bl); blobOrder.push(path); while (blobOrder.length > 4) { const old = blobOrder.shift(); if (old !== path && blobs.has(old)) { const q = blobs.get(old); blobs.delete(old); Promise.resolve(q).then(v => { if (v && v.startsWith('blob:')) URL.revokeObjectURL(v); }); } } return u; })
        .catch(() => path);
      blobs.set(path, p); return p;
    }
    function seekTo(sec, then) {
      const go2 = () => { try { audio.currentTime = sec; } catch (e) {} if (then) then(); };
      if (audio.readyState >= 1) go2(); else audio.addEventListener('loadedmetadata', go2, { once: true });
    }
    function finish() { audio.pause(); playing = false; idx = 0; $$('#txBody span').forEach(s => s.classList.remove('now')); ui(); onDone(); }
    audio.addEventListener('timeupdate', () => { if (!item || !playing) return; if (audio.currentTime >= item.o + item.d - 0.04) { finish(); return; } const t = audio.currentTime - item.o + 0.05; let k = 0; item.s.forEach((st, i) => { if (st <= t) k = i; }); if (!$('#txBody span.now') || k !== idx) { $$('#txBody span').forEach((s, i2) => s.classList.toggle('now', i2 === k)); idx = k; inner($('#txBody span.now')); } });
    audio.addEventListener('ended', () => { if (!item || !playing) return; finish(); });
    audio.addEventListener('error', () => { if (!item || !audio.dataset.path) return; playing = false; item = null; ui(); if (synthOK) { toast('The recording didn’t load — using your device voice instead.'); play(idx); } });
    function speakFrom(i, t) {
      if (t !== token) return;
      if (i >= sents.length) { playing = false; idx = 0; ui(); $$('#txBody span').forEach(s => s.classList.remove('now')); onDone(); return; }
      hl(i);
      const u = new SpeechSynthesisUtterance(sents[i]);
      u.rate = rate; if (dvoice) { u.voice = dvoice; u.lang = dvoice.lang; } else u.lang = 'en-US';
      u.onend = () => speakFrom(i + 1, t);
      u.onerror = e => { if (t === token && e.error !== 'interrupted' && e.error !== 'canceled') { playing = false; ui(); } };
      speechSynthesis.speak(u);
    }
    function play(from) {
      if (!sents.length) return;
      token++; const t = token;
      if (synthOK) speechSynthesis.cancel();
      if (item) {
        const path = srcOf(item), cur2 = item;
        playing = true; ui(); if (audio.dataset.path !== path) lbl.textContent = 'Loading…';
        Promise.resolve(ensureSrc(path)).then(url => {
          if (t !== token) return;
          const fresh = audio.dataset.path !== path;
          if (fresh) { audio.src = url; audio.dataset.path = path; }
          audio.playbackRate = rate;
          const inside = !fresh && audio.currentTime >= cur2.o && audio.currentTime < cur2.o + cur2.d - 0.1;
          const start = () => { const pr = audio.play(); if (pr && pr.catch) pr.catch(() => { if (t !== token) return; playing = false; ui(); }); ui(); };
          if (from != null) seekTo(cur2.o + (cur2.s[from] || 0), start);
          else if (!inside) seekTo(cur2.o, start);
          else start();
        });
        return;
      }
      if (!synthOK) return;
      if (mode() === 'n' && !warned) { warned = true; toast('This slide has no recording yet — using your device voice.'); }
      playing = true; ui();
      setTimeout(() => speakFrom(from != null ? from : idx, t), 60);
    }
    function pause() { token++; playing = false; if (item) audio.pause(); if (synthOK) speechSynthesis.cancel(); ui(); }
    function stop() { token++; playing = false; idx = 0; audio.pause(); if (synthOK) speechSynthesis.cancel(); $$('#txBody span').forEach(s => s.classList.remove('now')); ui(); }
    function load(k, txt) {
      stop();
      key = k; text = (txt || '').replace(/\s+/g, ' ').trim(); sents = split(text); idx = 0;
      resolveItem();
      $('#txBody').innerHTML = sents.length ? sents.map((s, i) => `<span data-k="${i}">${s}</span>`).join(' ') : '<em>No narration for this slide — it is self-guided.</em>';
      $$('#txBody span').forEach(s => s.addEventListener('click', () => play(+s.dataset.k)));
      ui();
    }
    btn.addEventListener('click', () => playing ? pause() : play());
    rsel.addEventListener('change', () => { rate = +rsel.value; store.rate = rate; save(); audio.playbackRate = rate; if (playing && !item) play(idx); });
    vsel.addEventListener('change', () => {
      const wasPlaying = playing; const at = idx; stop();
      choice = vsel.value; store.voice2 = choice; save();
      dvoice = dlist.find(v => 'd:' + v.name === choice) || dlist[0] || null;
      resolveItem(); ui();
      if (wasPlaying) play(at);
    });
    populate();
    if (synthOK) { if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', populate); else speechSynthesis.onvoiceschanged = populate; }
    if (!natural.length && !synthOK) { vsel.disabled = true; rsel.disabled = true; }
    return { load, play, pause, stop, get playing() { return playing; }, get ok() { return !!item || synthOK; } };
  })();
  const tts = narrator;

  /* hover / focus tooltips for chart marks */
  const tipEl = document.createElement('div'); tipEl.className = 'tipbox'; tipEl.hidden = true; tipEl.setAttribute('role', 'tooltip'); document.body.appendChild(tipEl);
  function showTip(el, x, y) {
    tipEl.textContent = el.getAttribute('data-tip'); tipEl.hidden = false;
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    tipEl.style.left = Math.max(8, Math.min(x + 14, innerWidth - w - 8)) + 'px';
    tipEl.style.top = (y + 18 + h > innerHeight ? y - h - 12 : y + 18) + 'px';
  }
  document.addEventListener('mousemove', e => { const el = e.target.closest ? e.target.closest('[data-tip]') : null; if (el) showTip(el, e.clientX, e.clientY); else tipEl.hidden = true; });
  document.addEventListener('focusin', e => { const el = e.target.closest ? e.target.closest('[data-tip]') : null; if (el) { const r = el.getBoundingClientRect(); showTip(el, r.left + r.width / 2, r.top + r.height / 2); } });
  document.addEventListener('focusout', () => { tipEl.hidden = true; });

  function onDone() {
    if (!autoplay) return;
    const f = flat[cur];
    if (INTERACTIVE.has(f.sl.type) || cur >= flat.length - 1) { setAuto(false); toast('Auto-play paused — this slide needs you.'); return; }
    setTimeout(() => { if (autoplay) go(cur + 1, { auto: true }); }, 900);
  }
  function setAuto(v) { autoplay = v; $('#autoBtn').setAttribute('aria-pressed', v ? 'true' : 'false'); }
  let toastT;
  function toast(msg) { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = msg; clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 3200); }

  /* ---------- navigation ---------- */
  function go(i, opts = {}) {
    if (!flat.length) return;
    cur = Math.max(0, Math.min(flat.length - 1, i));
    const f = flat[cur];
    store.cur = cur; store.seen[f.key] = 1; save();
    $('#stage').style.setProperty('--hue', `var(--${f.seg.hue})`);
    const bpc = (BP.find(d => d.d === f.seg.code) || { comps: [] }).comps.find(c => c[0] === f.mod.code);
    const inMod = flat.filter(x => x.si === f.si && x.mi === f.mi);
    $('#crumbs').innerHTML = `<span class="c-seg">${f.seg.label}</span><span>${f.mod.code} · ${f.mod.title}</span><span>slide ${f.li + 1} of ${inMod.length}</span>${bpc ? `<span class="c-q">${bpc[3]}–${bpc[4]} scored questions</span>` : ''}`;
    const el = $('#slide');
    el.className = 'slide t-' + (f.sl.type || 'content');
    el.innerHTML = renderSlide(f);
    mount(f, el);
    tts.load(f.key, f.sl.narr || '');
    updateRail(); updateProgress();
    $('#counter').textContent = `${cur + 1} / ${flat.length}`;
    $('#prevBtn').disabled = cur === 0; $('#nextBtn').disabled = cur === flat.length - 1;
    $('#stageScroll').scrollTop = 0; if (isNarrow()) window.scrollTo(0, 0);
    if (opts.auto && autoplay) tts.play(0);
  }

  $('#prevBtn').addEventListener('click', () => go(cur - 1));
  $('#nextBtn').addEventListener('click', () => go(cur + 1));
  $('#autoBtn').addEventListener('click', () => { setAuto(!autoplay); if (autoplay) { if (!tts.ok) { setAuto(false); toast('Narration is not available in this browser.'); return; } tts.play(); } });
  $('#focusBtn').addEventListener('click', e => { const on = $('#app').classList.toggle('focus'); e.currentTarget.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  $('#mapBtn').addEventListener('click', () => $('#app').classList.contains('rail-open') ? closeRail() : openRail());
  const tx = $('#tx'); if (store.txClosed) tx.open = false; tx.addEventListener('toggle', () => { store.txClosed = !tx.open; save(); });
  document.addEventListener('keydown', e => {
    if (!$('#exam').hidden) { if (e.key === 'Escape') return; return; }
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    else if (e.key.toLowerCase() === 'l' && !e.metaKey && !e.ctrlKey) { $('#listenBtn').click(); }
    else if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) { const r = $('.flash-root'); if (r && r._flip) r._flip(); }
    else if (e.key === 'Escape') closeRail();
  });

  /* ---------- branding + theme (all text via textContent: config is data, not markup) ---------- */
  function applyBranding() {
    document.title = CFG.title;
    const mark = $('.brand-mark'), name = $('.brand-name'), meta = $('.top-meta'), disc = $('#disclaimer');
    if (mark) mark.textContent = CFG.brand.mark;
    if (name) name.textContent = CFG.brand.name || '';
    if (meta) meta.textContent = CFG.meta || '';
    if (disc) { disc.textContent = CFG.disclaimer || ''; disc.hidden = !CFG.disclaimer; }
  }
  const THEMES = ['auto', 'light', 'dark'];
  function applyTheme() {
    const t = THEMES.includes(store.theme) ? store.theme : 'auto';
    if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
    const b = $('#themeBtn');
    if (b) { b.textContent = 'Theme: ' + t; b.setAttribute('aria-label', 'Colour theme: ' + t + '. Click to change.'); }
  }
  function initTheme() {
    applyTheme();
    const b = $('#themeBtn');
    if (b) b.addEventListener('click', () => { store.theme = THEMES[(THEMES.indexOf(store.theme || 'auto') + 1) % THEMES.length]; save(); applyTheme(); });
  }

  applyBranding();
  initTheme();
  buildRail();
  go(cur);
})();
