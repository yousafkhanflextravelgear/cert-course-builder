---
name: cert-course-builder
description: >
  This skill should be used when the user asks to "build a certification exam-prep course", "make a study course for
  [a certification] exam", "create an interactive training course for a professional certification", or wants a
  web-based exam-prep course with applied case studies, narrated audio, quizzes and a full timed mock exam. Also use it
  to check a finished course before sharing it (distractor bias, theme contrast, publish-safety and content-rights
  checks) or to publish a course built with it.
metadata:
  version: "0.2.0"
---

# Certification Exam-Prep Course Builder

Act as a professional certification-exam trainer who designs applied, scenario-based exam-prep training. Build an
interactive course (text, visuals, audio narration, videos, quizzes, a full mock exam) for whichever certification the
user picks, from the engine in `reference-template/`, and prove it is good with the scripts in `scripts/`.

Everything below is a standing specification. Nothing depends on any earlier conversation.

## What ships with this skill

| Path | Purpose |
|---|---|
| `reference-template/` | Working course engine plus a small **invented** demo course. Copy it; never edit it in place. |
| `scripts/check_distractor_bias.py` | Fails a question bank whose correct answers are too long or clustered in one position. |
| `scripts/check_theme_contrast.py` | WCAG contrast (light and dark) and dark-block sync for `themes/*.css`. |
| `scripts/scan_publish_safety.py` | Finds secrets, personal paths, private storage keys, real exam names in content. |
| `scripts/browser_smoke_test.mjs` | Headless-browser test: every slide, quizzes, mock exam, theme, 400px width, narration viewport. |
| `scripts/dump_questions.js` | Helper: loads a course's data files and prints its questions as JSON. |
| `references/content-rights.md` | What may and may not be shared, per body, with sources. **Read it before building.** |
| `references/rights-record-template.md` | One-page rights record to fill in per course. |

Run scripts from the course folder you created, e.g. `python <skill>/scripts/check_distractor_bias.py .`.

## 0. Principles that override everything else

1. **Original content only.** Never copy a body's blueprint text, exam items, courseware or "dump" questions. Teach
   from public standards and general knowledge, in new words. If the user pastes real exam questions, decline to use
   them and offer to write new questions on the same topic.
2. **Say what the course is not.** It is an independent study aid. It does not grant the certification and is not
   affiliated with or endorsed by the certifying body. The engine shows `COURSE_CONFIG.disclaimer`; always fill it in.
3. **Measure, don't eyeball.** Bias, contrast, overflow, viewport stability and publish-safety are scripted checks. A
   check that was not run counts as failed.
4. **Private until Gate C passes** (see section 9). Deliver every course as private unless the user asks to share it
   and the rights gates pass.

## 1. Choose the certification

Find which certification the course is for. If the user has not named one, search the web for current professional
certifications that do **not** require an accredited course as an eligibility gate (self-study sufficient; eligibility
rests on experience and/or passing the exam), and offer a short grouped shortlist (8-12 across a few fields). Their own
choice always overrides the list. Re-verify eligibility at build time; bodies change requirements.

Typical fits: IAPP (CIPP, CIPM, CIPT, AIGP), ISACA (CISA, CISM, CRISC), ISC2 (CISSP), CompTIA (A+, Network+, Security+),
AWS / Azure / Google Cloud role exams, Scrum.org (PSM, PSPO), ITIL Foundation. Exclude anything with a mandatory
accredited course (e.g. PMP, Scrum Alliance CSM).

**Rights check on the choice (Gate A, section 9).** Some bodies make third-party courses subject to a licence (ITIL is
one). Tell the user at once if the chosen certification is one of them: the course can be built for private study, but
not shared without that licence.

## 2. Research before building

Pull from the certifying body's **current** materials, and cite versions and dates:

- the official blueprint: version, effective date, domains and sub-competency weights (these set how many slides each
  domain gets);
- exam logistics: scored and unscored question counts, time limit, formats, scaled or raw passing score;
- prerequisites actually required (experience, education substitutions, endorsement). State them plainly in the course;
  never imply the course alone confers the certification;
- standards, laws or frameworks the blueprint draws on, with correct current dates and their **reuse terms**.

Link to the blueprint; do not copy it. Show the version and effective date persistently in the UI (`meta` and
`blueprintLabel` in `course.config.js`).

Fill in `references/rights-record-template.md` as `RIGHTS.md` now (Gate A).

## 3. Content architecture

Copy `reference-template/` to the working folder. Then:

1. `course.config.js`: title, brand, meta, blueprint label, **a unique `storageKey`** (`org-course-v1` style, never
   reused across courses), `videoWindowName`, `exam` {scored, full, half, scaleNote}, `disclaimer`.
2. `data-core.js`: replace the demo `BLUEPRINT` with the real domains, competencies and weights.
3. `seg*.js`: content, mapped 1:1 to the blueprint, weighted by domain. More weight means more slides.

Audience default: the learner already knows the general field and is studying to pass. Style: applied, not
definitional. Every module needs a realistic scenario or case study that forces application. Use three recurring,
visually distinct callouts: **Tip** (exam or field guidance), **Update** (recent regulatory/standard/process change),
**Trap** (common misconception or distractor pattern).

Slide types: content, opener, blueprint chart, case study, comparison table, inline-SVG charts (bars, lines, timeline),
icon grid, stat tiles, check, quiz, flashcards, video, exam. Charts are dependency-free SVG; no canvas or charting
library.

**Videos (default on).** One overview video for the orientation module; per domain about two: a broader walkthrough and
one tied to a specific concept. Place each directly after the slide it illustrates. For each: search for a public video,
then verify it with oEmbed (`https://www.youtube.com/oembed?url=<watch-url>&format=json`; it returns the exact title and
channel without scraping) and use that title and channel. Use the `video` slide type; it shows a poster and opens the
video in a new window, never an iframe. Write `why`, `watch` and a full `narr` for each. Do not describe a video as
reviewed or endorsed. Links work offline-built, but playback needs a connection. Skip videos only if the user says so.

**Design.** The default look is `themes/neutral.css` (system fonts, no third-party requests). Use a brand theme only if
the user supplies one: copy `neutral.css` (or start from the `harbor.css` / `graphite.css` examples), change colour and font values
only, keep every token, and link it in `index.html`. Self-host any web fonts. Keep visuals unbranded: no body logos.

## 4. Assessment design

- **Module quiz:** a handful of applied questions per module, each with a worked explanation for **every** option.
- **End-of-domain check:** a short cumulative check.
- **Full mock exam:** match the real exam's question count, time limit and domain mix as closely as the blueprint allows;
  show a domain and competency breakdown afterwards, and a scaled score if the real exam uses one.
- **Anti-bias rule (non-negotiable).** Distractors must be comparable in length and specificity to the correct answer.
  After drafting a bank, run

  ```
  python scripts/check_distractor_bias.py <course-dir>
  ```

  It fails if the correct option is the longest in more than 40% of items (chance is about 25% for four options), if it
  averages more than 1.20 times the distractor length, or if one position holds more than 40% of answers. Rewrite the
  worst items it lists (lengthen or tighten options, vary which option is longest) and re-run until it passes. Unchecked
  first drafts typically show 55-80% longest-correct. Do not weaken the thresholds to get a pass.
- The engine shuffles option order per session with a seeded shuffle, which hides position bias from learners but not
  length bias; that is why the length check matters.
- Questions are original: derived from public standards and general knowledge, never from the real exam.

## 5. Narration and audio

- Two recorded natural voices are the primary tier; every other voice falls back to the device's Web Speech API. The
  picker groups them as "Natural voices (recorded)" and "Device voices".
- Under each slide: a clickable sentence-level transcript; clicking seeks; the current sentence is highlighted.
- **Narration must never scroll or shift the viewport.** The engine's highlight handler is a no-op for scrolling. The
  browser test verifies this and fails if a scroll is reintroduced.
- Pack audio per module (not per slide) with stored sentence offsets; fetch via Blob URLs if the host lacks HTTP range
  support.
- **Finalise a module's slide order (videos included) before generating its audio.** The manifest keys recordings by
  `${seg.id}:${mod.code}:${slideIndex}`. Inserting a slide anywhere but the end of an already-narrated module silently
  shifts every later key (it fails safe to device TTS, so it is easy to miss). Either append the new slide's audio at
  the end of the module file or recompute every key.
- **Recorded-audio rights.** Read the TTS provider's current terms for the plan used (commercial use, attribution,
  voice consent). Disclose that the voices are AI-generated. Never clone a real person's voice without written consent.
  Do not bundle audio whose terms you have not recorded in `RIGHTS.md`.

## 6. UI shell (already implemented in the template)

Topbar (brand, blueprint version and date, progress, theme and focus toggles); collapsible course-map rail with a
seen/done mark per module; stage with breadcrumbs, slide, transcript; dock (prev/next, counter, play/pause/resume, voice,
rate, auto-advance). Progress, results, theme, transcript state, voice and rate persist in `localStorage` under the
course's own `storageKey`. Light and dark themes with validated contrast; responsive to 400px with no horizontal page
scroll (only tables, charts and code scroll inside their own boxes); keyboard navigation. External videos always open in a
new window.

## 7. Deliverables

1. **Hosted course:** `index.html` with supporting JS/CSS/data and packed audio. This is the learner's main version.
2. **Optional offline single file:** the same course in one `.html`, embedding only the two natural voices as `data:` URIs
   (replace network or blob audio loading with an in-memory map). Other voices still use device TTS. If too large to
   hand over, split into ordered parts with a one-line reassembly command and verify the rejoined file is byte-identical.

## 8. Verification before calling it done (run all; report real results)

```
python scripts/check_distractor_bias.py   <course-dir>          # must PASS
python scripts/check_theme_contrast.py    <course-dir>/themes/*.css   # must PASS
python scripts/scan_publish_safety.py     <course-dir>          # 0 errors (use --allow-cert-names for a private build)
node scripts/browser_smoke_test.mjs       <course-dir>          # needs Playwright + Chromium
```

The browser test walks every slide for console/page/network errors, completes every quiz and the mock exam, checks the
theme toggle and its persistence, checks 400px overflow, verifies video slides open in new windows with no iframe, and
verifies that narration highlights without moving the viewport. If Playwright is not available, perform the same checks by
hand in a headless browser.

Also check the rendered light and dark palettes, the offline build if made, and that every slide (videos included)
resolves its recorded audio by the right manifest key.

## 9. Content rights and sharing (three gates)

Read `references/content-rights.md`. It holds the rules, the per-body findings with sources, and the decision table.

- **Gate A, before building:** read the body's current copyright, trademark, candidate-agreement and exam-content pages;
  fill in `RIGHTS.md`; tell the user if the body requires a licence for derived materials.
- **Gate B, while writing:** original wording; no recalled or pasted exam items; link rather than copy the blueprint;
  nominative use of the certification name only; no logos; cite standards and their reuse terms (NIST publications need
  attribution; paid standards are never copied).
- **Gate C, before sharing:** run the publish-safety scan with zero errors; confirm the disclaimer, blueprint version,
  required trademark acknowledgements, AI-voice disclosure and external-video notice are in the UI; confirm font, icon,
  image and audio licences; remove private storage keys, personal paths and brand assets the user does not own.

When delivering a finished course, state which gate it has passed and whether it is **private** or **shareable**. If the
body requires a licence you do not have, say so and keep the course private. Offer the generic, non-branded version of the
topic as the shareable alternative.

## 10. Publishing a course the user built

If the user wants to publish a course (a public repo, a site, a portfolio piece): confirm Gate C, then put it in its own
folder or repo, not in this skill's repository; add the disclaimer, a `RIGHTS.md`, and a licence they choose for the
content (the skill's MIT licence covers the engine code only). Do not create or push a public repository without the
user's explicit instruction.

## 11. Definition of done

- Every domain and competency of the current blueprint is covered, weighted proportionally.
- Every module has at least one applied case and a quiz with explained answers.
- Orientation and every domain have verified, narrated video slides (unless the user opted out).
- A full mock exam matches the real exam's length, time and domain mix, with a post-exam breakdown.
- The bias, contrast, safety and browser checks have been **run and passed**, with the numbers reported.
- Two natural voices are wired with device fallback; narration verified not to move the viewport; every slide resolves
  its audio by the correct key.
- The rights record is complete and the course is labelled private or shareable.
