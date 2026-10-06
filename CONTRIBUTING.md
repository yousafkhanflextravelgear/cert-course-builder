# Contributing

Thanks for helping. This project builds study courses, so its one hard rule is about **content rights**.

## What is welcome

- Fixes and features for the course engine (`reference-template/app.js`, `engine.css`).
- New or improved **themes** (must pass the contrast check in light and dark).
- Improvements to the check scripts, with tests.
- Better docs, clearer errors, accessibility fixes.
- Additions to `references/content-rights.md`: a new body's policy, with a link and the date you read it.

## What will be declined

- Real exam questions, "dumps", candidate recollections, or text copied from a certifying body's blueprint,
  courseware or handbook. Even a single item. The demo course is deliberately about a fictional exam.
- Logos, badges or other marks you do not own; audio, fonts or images whose licence is not stated.
- Courses for real certifications. Build those in your own repository (see `docs/publishing-a-course.md`).

## Setup

```bash
pip install -r requirements-dev.txt
python -m pytest -q
python skills/cert-course-builder/scripts/check_distractor_bias.py skills/cert-course-builder/reference-template
python skills/cert-course-builder/scripts/check_theme_contrast.py skills/cert-course-builder/reference-template/themes/*.css
python skills/cert-course-builder/scripts/scan_publish_safety.py .
# browser test (needs Node 20+ and Playwright with Chromium)
npm i --no-save playwright && npx playwright install chromium
node skills/cert-course-builder/scripts/browser_smoke_test.mjs
```

CI runs exactly these.

## Changing questions

Keep distractors comparable in length and specificity to the correct answer. Run the bias check; if it names items to
rewrite, rewrite them rather than changing the thresholds. Every option needs an explanation of why it is right or wrong.

## Changing the engine

- Narration must never scroll or move the viewport. The browser test fails if a scroll is reintroduced.
- Keep the engine dependency-free (no framework, no CDN, no web fonts, no charting library).
- `engine.css` contains structure only; colours and fonts live in `themes/`. The two dark blocks in a theme must stay identical.
- Keep every string that reaches `innerHTML` author-controlled.

## Commits and PRs

Small, focused PRs with the checklist in the template filled in. Describe behaviour changes in `CHANGELOG.md`.
