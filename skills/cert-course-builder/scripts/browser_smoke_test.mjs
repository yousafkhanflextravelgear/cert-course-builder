#!/usr/bin/env node
/* Browser smoke test for a course folder (default: the reference template).
 *
 *   node scripts/browser_smoke_test.mjs [course-dir]
 *
 * Needs Playwright with a Chromium build. Set PLAYWRIGHT_MODULE to its path if it is not resolvable from here,
 * and PLAYWRIGHT_CHROMIUM to an executable if the default browser is not installed.
 * Checks (the "definition of done" items that can be automated):
 *   1. no console errors, page errors or failed requests while walking EVERY slide
 *   2. every module quiz can be completed and shows an explanation per answer
 *   3. the mock exam can be started, answered, submitted and shows the competency breakdown
 *   4. theme toggle switches light/dark and the choice survives a reload
 *   5. no horizontal page overflow at 400px width on every slide
 *   6. narration (stubbed speech engine) highlights sentences but never moves the viewport
 *   7. video slides open links in a new window and embed no iframe
 *   8. all of the above under a strict Content-Security-Policy (the test server sends one; violations are console errors)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let pw;
try { pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright'); }
catch { console.error('Playwright not found. npm i -D playwright, or set PLAYWRIGHT_MODULE.'); process.exit(2); }

const dir = path.resolve(process.argv[2] || new URL('../reference-template', import.meta.url).pathname);
if (!fs.existsSync(path.join(dir, 'index.html'))) { console.error(`no index.html in ${dir}`); process.exit(2); }

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
  const file = path.join(dir, rel);
  if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, {
    'content-type': MIME[path.extname(file)] || 'application/octet-stream',
    // strict policy: no third-party origins, no frames, no eval. Any violation shows up as a console error below.
    'content-security-policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob: data:; connect-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'"
  });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/index.html`;

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };

const launchOpts = { headless: true };
if (process.env.PLAYWRIGHT_CHROMIUM) launchOpts.executablePath = process.env.PLAYWRIGHT_CHROMIUM;
const browser = await pw.chromium.launch(launchOpts);

async function freshPage(viewport = { width: 1100, height: 700 }, { stubSpeech = false } = {}) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', m => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', e => problems.push('pageerror: ' + e.message));
  page.on('requestfailed', r => problems.push('requestfailed: ' + r.url()));
  page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('audio-manifest.js')) problems.push(`http ${r.status()}: ${r.url()}`); });
  if (stubSpeech) await page.addInitScript(() => {
    const voices = [{ name: 'Test Voice', lang: 'en-US', default: true, localService: true, voiceURI: 'test' }];
    window.__spoken = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    const fake = {
      getVoices: () => voices, addEventListener() {}, cancel() { clearTimeout(this._t); },
      speak(u) { window.__spoken.push(u.text); this._t = setTimeout(() => u.onend && u.onend({}), 250); }
    };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
  });
  await page.goto(base);
  await page.waitForSelector('#slide');
  return { ctx, page, problems };
}
const counter = async page => { const t = await page.textContent('#counter'); const m = t.match(/(\d+)\s*\/\s*(\d+)/); return { i: +m[1], n: +m[2] }; };

/* ---- 1, 5, 7: walk every slide, desktop then phone width ---- */
{
  const { ctx, page, problems } = await freshPage();
  const { n } = await counter(page);
  let iframeSeen = false, videoSlides = 0, badLinks = [];
  for (let k = 0; k < n; k++) {
    if (await page.locator('#slide iframe').count()) iframeSeen = true;
    if (await page.locator('#slide .v-actions').count()) {
      videoSlides++;
      for (const a of await page.locator('#slide .v-actions a').all()) {
        if ((await a.getAttribute('target')) !== '_blank' || !/noopener/.test(await a.getAttribute('rel') || '')) badLinks.push(await a.getAttribute('href'));
      }
    }
    if (k < n - 1) await page.click('#nextBtn');
  }
  check('walk all slides without console/page/network errors', problems.length === 0, `${n} slides` + (problems.length ? '; ' + problems.slice(0, 3).join(' | ') : ''));
  check('video slides: no iframe, links open in new window with noopener', !iframeSeen && badLinks.length === 0 && videoSlides > 0, `${videoSlides} video slide(s)`);
  await ctx.close();

  const m = await freshPage({ width: 400, height: 800 });
  const overflowing = [];
  for (let k = 0; k < n; k++) {
    const over = await m.page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth);
    if (over > 0) overflowing.push(`slide ${k + 1} (+${over}px)`);
    if (k < n - 1) await m.page.click('#nextBtn');
  }
  check('no horizontal page overflow at 400px on any slide', overflowing.length === 0, overflowing.slice(0, 5).join(', '));
  check('no errors at phone width', m.problems.length === 0, m.problems.slice(0, 3).join(' | '));
  await m.ctx.close();
}

/* ---- 2: every module quiz ---- */
{
  const { ctx, page, problems } = await freshPage();
  const { n } = await counter(page);
  let quizzes = 0, answered = 0, missingWhy = 0;
  for (let k = 0; k < n; k++) {
    if (await page.locator('#slide [data-start]').count()) {
      quizzes++;
      await page.click('#slide [data-start]');
      for (let guard = 0; guard < 30; guard++) {
        const opt = page.locator('#slide .opts button').first();
        if (!(await opt.count())) break;
        await opt.click();
        answered++;
        if (!(await page.locator('#slide .why').first().isVisible())) missingWhy++;
        await page.click('#slide [data-next]');
      }
      if (!(await page.locator('#slide .result-big').count())) problems.push('quiz did not reach a results screen');
    }
    if (k < n - 1) await page.click('#nextBtn');
  }
  check('all module quizzes complete and explain every answer', quizzes > 0 && missingWhy === 0 && problems.length === 0, `${quizzes} quizzes, ${answered} answers` + (problems.length ? '; ' + problems[0] : ''));
  await ctx.close();
}

/* ---- 3: mock exam end to end ---- */
{
  const { ctx, page, problems } = await freshPage();
  const { n } = await counter(page);
  for (let k = 0; k < n - 1; k++) await page.click('#nextBtn');
  await page.click('[data-mode="full"]');
  await page.waitForSelector('#exQ');
  let q = 0;
  for (let guard = 0; guard < 200; guard++) {
    const opt = page.locator('#exQ .opts button, #exQ [role="radio"], #exQ button.opt').first();
    if (await opt.count()) await opt.click();
    q++;
    const label = await page.textContent('#exNext');
    await page.click('#exNext');
    if (/submit/i.test(label)) break;
  }
  await page.click('#exSubmit');
  await page.click('#exYes');
  await page.waitForSelector('#exBack');
  const text = await page.textContent('#exam');
  check('mock exam: answer, submit, results with domain and competency breakdown', /competency/i.test(text) && /domain/i.test(text) && problems.length === 0, `${q} questions` + (problems.length ? '; ' + problems[0] : ''));
  await ctx.close();
}

/* ---- 4: theme toggle persists ---- */
{
  const { ctx, page } = await freshPage();
  const seen = [];
  for (let k = 0; k < 3; k++) { await page.click('#themeBtn'); seen.push(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))); }
  await page.click('#themeBtn'); await page.click('#themeBtn'); // light -> dark
  const chosen = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.reload(); await page.waitForSelector('#slide');
  const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  check('theme toggle cycles auto/light/dark and survives reload', new Set(seen).size >= 2 && after === chosen, `cycle=${seen.join('>')}; chosen=${chosen}; body=${bg}`);
  await ctx.close();
}

/* ---- 6: narration never moves the viewport ---- */
{
  const { ctx, page } = await freshPage({ width: 900, height: 420 }, { stubSpeech: true });
  const total = (await counter(page)).n;
  // the scroller is the stage on wide layouts and the document on short/narrow ones: watch both
  const room = () => page.evaluate(() => { const s = document.querySelector('#stageScroll'), d = document.scrollingElement; return Math.max(s.scrollHeight - s.clientHeight, d.scrollHeight - d.clientHeight); });
  for (let k = 0; k < total - 1 && (await room()) < 150; k++) await page.click('#nextBtn'); // walk to a slide long enough to scroll
  const scrollable = await room();
  await page.click('#listenBtn');
  await page.waitForTimeout(700);
  const highlighted = await page.locator('#txBody .now').count();
  const target = Math.max(0, Math.min(120, scrollable - 1));
  await page.evaluate(t => { const s = document.querySelector('#stageScroll'); if (s.scrollHeight > s.clientHeight) s.scrollTop = t; else window.scrollTo(0, t); }, target);
  const pos = () => page.evaluate(() => [document.querySelector('#stageScroll').scrollTop, window.scrollY]);
  const start = await pos();
  const samples = [];
  for (let k = 0; k < 6; k++) { await page.waitForTimeout(300); samples.push(await pos()); }
  const moved = samples.some(([s, w]) => Math.abs(s - start[0]) > 1 || Math.abs(w - start[1]) > 1);
  const spoken = await page.evaluate(() => window.__spoken.length);
  check('narration highlights the spoken sentence', highlighted > 0 && spoken > 1, `${spoken} sentences spoken`);
  check('narration never scrolls the page or stage', !moved && scrollable > 0 && start[0] + start[1] > 0, `scrollable=${scrollable}px, started at ${start.join('/')}, sampled ${samples.length}x`);
  await ctx.close();
}

await browser.close();
server.close();
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} browser checks passed`);
process.exit(failed.length ? 1 : 0);
