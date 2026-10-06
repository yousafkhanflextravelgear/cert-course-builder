#!/usr/bin/env node
/* Dump every multiple-choice question in a course as JSON, by loading the course's own data files.
 *
 *   node dump_questions.js <course-dir>      (the directory that holds index.html)
 *
 * It reads the <script src="..."> list from index.html, runs the data/content scripts (everything except
 * app.js and audio-manifest.js) inside an isolated vm context, then walks:
 *   - window.EXAM_BANK                                   -> group "exam-bank"
 *   - COURSE.segments[].modules[].slides[] type "quiz"   -> group "quizzes"
 *   - COURSE.segments[].modules[].slides[] type "check"  -> group "checks"
 * Output: { "questions": [ { group, source, id, d, c, opts: [...], a } ... ] }  on stdout.
 * Exit 2 on any load error. No network, no file writes. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = process.argv[2];
if (!dir || !fs.existsSync(path.join(dir, 'index.html'))) {
  console.error('usage: node dump_questions.js <course-dir containing index.html>');
  process.exit(2);
}
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map(m => m[1])
  .filter(s => !/^https?:/.test(s) && !/(^|\/)(app|audio-manifest)\.js$/.test(s));

const ctx = {};
ctx.window = ctx;
ctx.console = console;
vm.createContext(ctx);
for (const rel of scripts) {
  const file = path.join(dir, rel);
  if (!fs.existsSync(file)) { console.error(`missing script referenced by index.html: ${rel}`); process.exit(2); }
  try { vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: rel, timeout: 5000 }); }
  catch (e) { console.error(`error while loading ${rel}: ${e.message}`); process.exit(2); }
}

const out = [];
const bank = ctx.EXAM_BANK || [];
bank.forEach((q, i) => out.push({ group: 'exam-bank', source: `exam-bank.js#${i + 1}`, id: `Q${i + 1}`, d: q.d, c: q.c, opts: q.opts, a: q.a }));
((ctx.COURSE && ctx.COURSE.segments) || []).forEach(seg => (seg.modules || []).forEach(mod => (mod.slides || []).forEach((sl, li) => {
  const where = `${seg.id}:${mod.code}:${li}`;
  if (sl.type === 'quiz') (sl.items || []).forEach((q, k) => out.push({ group: 'quizzes', source: where, id: `${sl.id || where}#${k + 1}`, c: q.code, opts: q.opts, a: q.a }));
  if (sl.type === 'check') out.push({ group: 'checks', source: where, id: where, c: sl.code, opts: sl.opts, a: sl.a });
})));
process.stdout.write(JSON.stringify({ questions: out }));
