/* cert-course-builder — shared data + authoring helpers.
   BLUEPRINT is the demo course's invented blueprint: replace it with the target certification's own domain / competency
   structure (as YOUR OWN summary, not a copy of the certifying body's text — see docs/content-rights.md).
   Each comps row is [code, full statement, short label, min scored questions, max scored questions]. */
window.COURSE = { segments: [] };

window.BLUEPRINT = [
  { d: 'I', hue: 'd1', name: 'Detect and triage', min: 7, max: 9, comps: [
    ['I.A', 'Classify and prioritise incoming incidents', 'Classify & prioritise', 3, 5],
    ['I.B', 'Triage reports and assign clear ownership', 'Triage & ownership', 3, 5]]},
  { d: 'II', hue: 'd2', name: 'Respond and communicate', min: 8, max: 10, comps: [
    ['II.A', 'Contain the problem and restore service', 'Contain & restore', 4, 6],
    ['II.B', 'Communicate with stakeholders while the incident runs', 'Stakeholder comms', 3, 5]]},
  { d: 'III', hue: 'd3', name: 'Learn and improve', min: 6, max: 8, comps: [
    ['III.A', 'Run blameless reviews that find contributing factors', 'Blameless reviews', 3, 4],
    ['III.B', 'Track corrective actions until they are verified', 'Corrective actions', 3, 4]]}
];

/* One line-icon set, 24px grid, drawn with currentColor */
window.ICONS = {
  scale: '<path d="M12 3v18M6 21h12M4 7h16"/><path d="M7 7l-3 7a3 3 0 0 0 6 0z"/><path d="M17 7l-3 7a3 3 0 0 0 6 0z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  db: '<ellipse cx="12" cy="5.5" rx="7" ry="2.8"/><path d="M5 5.5v13c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8v-13M5 12c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8"/>',
  alert: '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15.5 4.8a3.2 3.2 0 0 1 0 6.3M17.5 14.3c2.2.8 3.5 3 3.5 5.7"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  org: '<path d="M4 21V6l8-3 8 3v15"/><path d="M9.5 21v-4h5v4M8 9h2M14 9h2M8 13h2M14 13h2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
  gavel: '<path d="M13.5 4.5l6 6M10.5 7.5l6 6M12 6l-3.5 3.5M15 9l-3.5 3.5M10 11l-7 7M3 21h9"/>',
  chart: '<path d="M4 4v16h16"/><path d="M8.5 16v-4M12.5 16V8.5M16.5 16v-6"/>',
  bot: '<rect x="4.5" y="8" width="15" height="11" rx="3"/><path d="M12 4.5V8M9.3 13h.2M14.5 13h.2M9.5 16h5"/><circle cx="12" cy="3.5" r="1"/>',
  link: '<path d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1 1"/><path d="M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1-1"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  list: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 6l1.2 1.2L7.5 5M4 12l1.2 1.2L7.5 11M4 18l1.2 1.2L7.5 17"/>',
  sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16.5 6.5l2 2M14.5 8.5l2 2"/>',
  cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.4-9 5.5 5.5 0 0 1 10.6-1.2A4.4 4.4 0 0 1 17 18.5z"/>',
  server: '<rect x="4" y="4" width="16" height="7" rx="1.5"/><rect x="4" y="13" width="16" height="7" rx="1.5"/><path d="M8 7.5h.2M8 16.5h.2"/>',
  face: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><circle cx="12" cy="10" r="2.5"/><path d="M8.5 16.5c.9-1.6 2.1-2.3 3.5-2.3s2.6.7 3.5 2.3"/>',
  power: '<path d="M12 3v8"/><path d="M6.4 6.6a8 8 0 1 0 11.2 0"/>',
  cycle: '<path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.6 4.5M20 20v-4h-4"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  bolt: '<path d="M13 2.5L4.5 13.5h6.5L10 21.5l8.5-11H12z"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/>',
  audio: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  copyright: '<circle cx="12" cy="12" r="9"/><path d="M14.8 9.6a3.6 3.6 0 1 0 0 4.8"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M14.8 9.2c-.4-1-1.5-1.6-2.8-1.6-1.7 0-2.9.9-2.9 2.1 0 2.9 5.8 1.5 5.8 4.4 0 1.2-1.3 2.2-2.9 2.2-1.4 0-2.5-.6-2.9-1.7M12 6v1.6M12 16.3V18"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.2 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/><path d="M8 12h2l1-2 2 4 1-2h2"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7M3 13h18"/>',
  bank: '<path d="M3 10l9-6 9 6M5 10v8M9.7 10v8M14.3 10v8M19 10v8M3 21h18"/>',
  school: '<path d="M2 9.5l10-5 10 5-10 5z"/><path d="M6 11.5v4.5c3 2 9 2 12 0v-4.5M22 9.5V15"/>',
  passport: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M9 16.5h6"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.4"/>',
  chat: '<path d="M4 5h16v11H9.5L4 20z"/><path d="M8 9.5h8M8 12.5h5"/>',
  factory: '<path d="M3 21V11l6 3.5V11l6 3.5V7l6-3v17z"/><path d="M7 18h2M12 18h2M17 18h2"/>',
  zap: '<path d="M4 20h16M7 20V9l5-5 5 5v11"/><path d="M12.8 9.5l-2 3.2h2.4l-1.6 3.3"/>',
  vote: '<path d="M4 13h16v8H4z"/><path d="M8 13V5.5L11 3l5 3.5V13"/><path d="M10 8.5l1.5 1.5 3-3"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  handshake: '<path d="M3 10l4-4 5 2 5-2 4 4"/><path d="M3 10l6 7c1 1 2 1 3 0l1-1c1 1 2 1 3 0l5-6"/><path d="M12 8l-3 3c.8.8 2 .8 2.8 0L13 10"/>',
  megaphone: '<path d="M3 10v4h3l8 5V5l-8 5z"/><path d="M17.5 9a4 4 0 0 1 0 6M6 14l1.5 5.5H10L9 14"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  wrench: '<path d="M14.5 5.5a4 4 0 0 0-5 5L4 16l4 4 5.5-5.5a4 4 0 0 0 5-5L16 12l-4-4z"/>',
  graduation: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  pulse: '<path d="M3 12h4l2-6 4 12 2-6h6"/>'
};

/* Authoring helpers: every string is trusted, author-written HTML */
(function () {
  const wrap = t => /^\s*<(p|ul|ol|div|table|dl|figure)/.test(t) ? t : `<p>${t}</p>`;
  const ic = (n, cls) => `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
  const esc = s => String(s).replace(/&(?!#?\w+;)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const fmtN = v => (Math.round(v * 10) / 10).toLocaleString('en-US');
  window.H = {
    ic,
    tip: (t, l) => `<div class="co tip"><p class="co-l">${ic('eye')}${l || 'Tip'}</p>${wrap(t)}</div>`,
    trap: (t, l) => `<div class="co trap"><p class="co-l">${ic('alert')}${l || 'Trap'}</p>${wrap(t)}</div>`,
    upd: (t, l) => `<div class="co upd"><p class="co-l">${ic('clock')}${l || 'Update'}</p>${wrap(t)}</div>`,
    key: (t, l) => `<div class="co key"><p class="co-l">${ic('key')}${l || 'Key point'}</p>${wrap(t)}</div>`,
    ul: a => `<ul>${a.map(x => `<li>${x}</li>`).join('')}</ul>`,
    ol: a => `<ol>${a.map(x => `<li>${x}</li>`).join('')}</ol>`,
    tbl: (heads, rows) => `<div class="tbl"><table><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
    fig: (svg, cap) => `<figure class="fig"><div class="svgwrap">${svg}</div><figcaption>${cap}</figcaption></figure>`,
    cols: (...c) => `<div class="cols">${c.map(x => `<div>${x}</div>`).join('')}</div>`,
    panel: (h, body, icon) => `<div class="panel"><h4>${icon ? ic(icon) : ''}${h}</h4>${wrap(body)}</div>`,
    /* terms: [heading, text] or [heading, text, icon] */
    terms: a => `<div class="grid3">${a.map(([h, p, i]) => `<div class="term"><h4>${i ? ic(i) : ''}${h}</h4><p>${p}</p></div>`).join('')}</div>`,
    /* icon tiles: [icon, title, text, warn?] */
    tiles: a => `<div class="icon-grid">${a.map(([i, b, s, w]) => `<div class="icon-tile${w ? ' warn' : ''}">${ic(i)}<b>${b}</b>${s ? `<span>${s}</span>` : ''}</div>`).join('')}</div>`,
    /* stat tiles: [value, label, cite] */
    stats: a => `<div class="stats">${a.map(([v, l, c]) => `<div class="stat"><b>${v}</b><span>${l}</span>${c ? `<span class="cite">${c}</span>` : ''}</div>`).join('')}</div>`,
    arrowDefs: id => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>`,

    /* Horizontal bar chart — one series, one scale, direct labels, hover tips, table view.
       o = { title, sub, unit, pre, rows:[[label, value, tip]], max, cite, illus, label:w } */
    bars: o => {
      const W = o.w || 760, L = o.label || (o.w ? 150 : 230), R = o.w ? 70 : 90, rowH = 34, top = o.ref ? 26 : 10;
      const max = o.max || Math.max(...o.rows.map(r => r[1]));
      const step = o.step || niceStep(max);
      const axisMax = Math.ceil(max / step) * step;
      const x = v => L + (W - L - R) * v / axisMax;
      const Hh = top + o.rows.length * rowH + 30;
      let g = '';
      for (let v = 0; v <= axisMax + 1e-9; v += step) {
        g += `<line x1="${x(v)}" x2="${x(v)}" y1="${top - 4}" y2="${Hh - 24}" class="${v === 0 ? 'axis' : 'grid'}" stroke-width="1"/><text x="${x(v)}" y="${Hh - 8}" text-anchor="middle" class="t-sm t-mute mono">${(o.pre || '') + fmtN(v)}</text>`;
      }
      if (o.ref) g += `<line x1="${x(o.ref[0])}" x2="${x(o.ref[0])}" y1="${top - 6}" y2="${Hh - 24}" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/><text x="${x(o.ref[0]) + 5}" y="${top + 4}" class="t-sm t-2" font-weight="600">${o.ref[1]}</text>`;
      o.rows.forEach((r, k) => {
        const y = top + k * rowH, w = Math.max(2, x(r[1]) - x(0)), bh = 16, by = y + (rowH - bh) / 2;
        const tip = `${r[0]}: ${(o.pre || '') + fmtN(r[1])}${o.unit ? ' ' + o.unit : ''}${r[2] ? ' — ' + r[2] : ''}`;
        g += `<g data-tip="${esc(tip)}" tabindex="0"><rect x="0" y="${y}" width="${W}" height="${rowH}" fill="transparent"/>`
          + `<text x="${L - 12}" y="${y + rowH / 2 + 4}" text-anchor="end" class="t-md">${r[0]}</text>`
          + `<path class="bar${r[3] ? ' alt' : ''}" d="M${x(0)},${by} h${Math.max(0, w - 4)} a4,4 0 0 1 4,4 v${bh - 8} a4,4 0 0 1 -4,4 h${-Math.max(0, w - 4)} z"/>`
          + `<text x="${x(0) + w + 8}" y="${y + rowH / 2 + 4}" class="t-md mono" font-weight="600">${(o.pre || '') + fmtN(r[1])}${o.suffix || ''}</text></g>`;
      });
      return `<figure class="chart"><div class="chart-h"><p class="chart-t">${o.title}</p>${o.sub ? `<p class="chart-s">${o.sub}</p>` : ''}${o.illus ? '<span class="illus">Illustrative data</span>' : ''}</div><div class="svgwrap"><svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(o.title)}">${g}</svg></div>${o.cite ? `<p class="cite">${o.cite}</p>` : ''}<details><summary>Show data table</summary>${H.tbl([o.colL || 'Item', o.colV || (o.unit || 'Value'), 'Note'], o.rows.map(r => [r[0], `<span class="num">${(o.pre || '') + fmtN(r[1])}${o.suffix || ''}</span>`, r[2] || '']))}</details></figure>`;
    },


    /* Line chart — up to 3 series on one y-scale. o = { title, sub, illus, x:[labels], series:[{name, v:[..], dash}], yMin, yMax, yStep, unit, ref:[v,label], marks:[[i,label]], cite } */
    lines: o => {
      const W = o.w || 760, L = 54, R = o.w ? 104 : 120, T = 18, B = 34, Hh = o.w ? 300 : 280;
      const n = o.x.length, y0 = o.yMin, y1 = o.yMax, st = o.yStep || niceStep(y1 - y0);
      const dec = st < 1 ? Math.ceil(-Math.log10(st) - 1e-9) : 0, fv = v => (+v).toFixed(dec);
      const X = i => L + (W - L - R) * i / (n - 1), Y = v => T + (Hh - T - B) * (1 - (v - y0) / (y1 - y0));
      const cls = ['s-d1', 's-d2', 's-d4'], fcls = ['f-d1', 'f-d2', 'f-d4'], tcls = ['t-d1', 't-d2', 't-d4'];
      let g = '';
      for (let v = y0; v <= y1 + 1e-9; v += st) g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" class="${v === y0 ? 'axis' : 'grid'}" stroke-width="1"/><text x="${L - 8}" y="${Y(v) + 4}" text-anchor="end" class="t-sm t-mute mono">${fv(v)}${o.unit || ''}</text>`;
      const every = Math.ceil(n / 8);
      o.x.forEach((lb, i) => { if (i % every === 0 || i === n - 1) g += `<text x="${X(i)}" y="${Hh - 12}" text-anchor="middle" class="t-sm t-mute mono">${lb}</text>`; });
      if (o.ref) g += `<line x1="${L}" x2="${W - R}" y1="${Y(o.ref[0])}" y2="${Y(o.ref[0])}" stroke="var(--bad)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${W - R + 6}" y="${Y(o.ref[0]) + 4}" class="t-sm t-bad" font-weight="600">${o.ref[1]}</text>`;
      (o.marks || []).forEach(([i, lb]) => { g += `<line x1="${X(i)}" x2="${X(i)}" y1="${T}" y2="${Hh - B}" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3"/><text x="${X(i) + 4}" y="${T + 10}" class="t-sm t-2" font-weight="600">${lb}</text>`; });
      o.series.forEach((sr, k) => {
        const pts = sr.v.map((v, i) => v == null ? null : [X(i), Y(v)]);
        let d = '', pen = false; pts.forEach(p => { if (!p) { pen = false; return; } d += (pen ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); pen = true; });
        g += `<path d="${d}" fill="none" class="${cls[k]}" stroke-width="2" ${sr.dash ? 'stroke-dasharray="6 4"' : ''} stroke-linejoin="round"/>`;
        const lastI = sr.v.length - 1 - [...sr.v].reverse().findIndex(v => v != null);
        if (lastI === n - 1 && !o.w) g += `<text x="${X(lastI) + 8}" y="${Y(sr.v[lastI]) + 4 + (k ? 12 * (o.labelNudge || 0) : 0)}" class="t-sm ${tcls[k]}" font-weight="700">${sr.name}</text>`;
        sr.v.forEach((v, i) => { if (v == null) return; g += `<g data-tip="${esc(sr.name + ' · ' + o.x[i] + ': ' + fv(v) + (o.unit || ''))}" tabindex="-1"><circle cx="${X(i)}" cy="${Y(v)}" r="9" fill="transparent"/><circle cx="${X(i)}" cy="${Y(v)}" r="${i === lastI ? 4.5 : 2.5}" class="${fcls[k]}" stroke="var(--surface)" stroke-width="1.5"/></g>`; });
      });
      const legend = o.series.length > 1 ? `<div class="bp-legend">${o.series.map((sr, k) => `<span><i style="background:var(--${['d1', 'd2', 'd4'][k]})"></i>${sr.name}</span>`).join('')}</div>` : '';
      return `<figure class="chart"><div class="chart-h"><p class="chart-t">${o.title}</p>${o.sub ? `<p class="chart-s">${o.sub}</p>` : ''}${o.illus ? '<span class="illus">Illustrative data</span>' : ''}</div>${legend}<div class="svgwrap"><svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(o.title)}">${g}</svg></div>${o.cite ? `<p class="cite">${o.cite}</p>` : ''}<details><summary>Show data table</summary>${H.tbl([o.xName || 'Period', ...o.series.map(s => s.name)], o.x.map((lb, i) => [lb, ...o.series.map(s => s.v[i] == null ? '—' : `<span class="num">${fv(s.v[i])}${o.unit || ''}</span>`)]))}</details></figure>`;
    },

    /* Proportional timeline. o = { title, sub, from:'YYYY-MM-DD', to, events:[[date, label, sub, emph]], today, cite } */
    timeline: o => {
      const W = 820, L = 20, R = 20, axisY = 150;
      const t = d => new Date(d + 'T00:00:00Z').getTime();
      const t0 = t(o.from), t1 = t(o.to);
      const x = d => L + (W - L - R) * (t(d) - t0) / (t1 - t0);
      let g = `<line x1="${L}" x2="${W - R}" y1="${axisY}" y2="${axisY}" class="axis" stroke-width="2"/>`;
      for (let y = new Date(o.from).getUTCFullYear(); y <= new Date(o.to).getUTCFullYear(); y++) {
        const d = `${y}-01-01`; if (t(d) < t0 || t(d) > t1) continue;
        g += `<line x1="${x(d)}" x2="${x(d)}" y1="${axisY - 5}" y2="${axisY + 5}" class="axis" stroke-width="1.5"/><text x="${x(d)}" y="${axisY + 20}" text-anchor="middle" class="t-sm t-mute mono">${y}</text>`;
      }
      if (o.today) g += `<line x1="${x(o.today)}" x2="${x(o.today)}" y1="26" y2="${axisY + 30}" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/><text x="${x(o.today)}" y="18" text-anchor="middle" class="t-sm t-2" font-weight="600">today</text>`;
      o.events.forEach((e, k) => {
        const up = k % 2 === 0, lvl = Math.floor(k / 2) % 2, xx = x(e[0]);
        const ty = up ? axisY - 22 - lvl * 44 : axisY + 52 + lvl * 44;
        const anchor = xx < 110 ? 'start' : xx > W - 110 ? 'end' : 'middle';
        const dd = new Date(e[0] + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
        g += `<g data-tip="${esc(dd + ' — ' + e[1] + (e[2] ? ': ' + e[2] : ''))}" tabindex="0"><line x1="${xx}" x2="${xx}" y1="${axisY}" y2="${up ? ty + 6 : ty - 26}" class="grid" stroke-width="1"/><circle cx="${xx}" cy="${axisY}" r="${e[3] ? 7 : 5}" class="${e[3] ? 'f-hue' : 'f-surf'}" stroke="var(--hue)" stroke-width="2"/>`
          + `<text x="${xx}" y="${ty - 14}" text-anchor="${anchor}" class="t-sm mono t-mute">${dd}</text><text x="${xx}" y="${ty}" text-anchor="${anchor}" class="t-sm" font-weight="700">${e[1]}</text></g>`;
      });
      const Hh = axisY + 150;
      return `<figure class="chart"><div class="chart-h"><p class="chart-t">${o.title}</p>${o.sub ? `<p class="chart-s">${o.sub}</p>` : ''}</div><div class="svgwrap"><svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(o.title)}" style="min-width:640px">${g}</svg></div>${o.cite ? `<p class="cite">${o.cite}</p>` : ''}<details><summary>Show data table</summary>${H.tbl(['Date', 'Milestone', 'Detail'], o.events.map(e => [`<span class="num">${e[0]}</span>`, e[1], e[2] || '']))}</details></figure>`;
    }
  };
  function niceStep(max) { const raw = max / 5, p = Math.pow(10, Math.floor(Math.log10(raw))); const n = raw / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
})();
