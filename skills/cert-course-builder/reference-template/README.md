# Reference template

A dependency-free course player plus a small demo course about a **fictional** exam ("Practical Incident Management").
Copy this folder to start a new course; never edit it in place.

Open `index.html` through any static server (`python -m http.server` in this folder). It also works from `file://` in most browsers.

## Turn it into your course

1. **`course.config.js`**: title, brand, blueprint label, a **unique `storageKey`**, exam settings, the non-affiliation
   disclaimer.
2. **`data-core.js`**: replace `BLUEPRINT` with the target exam's domains, competencies and weights (your own summary,
   not the body's text).
3. **`seg*.js`**: write the content; delete the demo segments you do not need and keep `index.html`'s script list in sync.
4. **`exam-bank.js`**: write original questions, each with an explanation for every option.
5. **Theme**: keep `themes/neutral.css`, or copy it and change colours and fonts only.
6. Run the checks from the repository root:

```bash
python skills/cert-course-builder/scripts/check_distractor_bias.py <course>
python skills/cert-course-builder/scripts/check_theme_contrast.py <course>/themes/*.css
python skills/cert-course-builder/scripts/scan_publish_safety.py <course>
node   skills/cert-course-builder/scripts/browser_smoke_test.mjs <course>
```

## Slide types

`content` (default) · `opener` · `blueprint` · `case` (scenario + reveal prompts) · `quiz` · `check` (single question) ·
`flash` (flashcards) · `video` (poster that opens the video in a new window) · `exam` (mock-exam launcher).
Authoring helpers in `data-core.js`: `H.tip / trap / upd / key`, `H.ul / ol / tbl / cols / panel / terms / tiles / stats`,
and inline-SVG `H.bars / lines / timeline / fig`.

## Notes

- Progress, results, theme, voice and rate live in `localStorage` under `storageKey`.
- Videos never use iframes. Verify each with YouTube's oEmbed endpoint and use the exact title and channel it returns.
- Audio is optional: without `audio-manifest.js` the engine uses the device's speech voices. See `docs/narration-audio.md`.
- The demo course text is CC BY 4.0 (`CONTENT-LICENSE.md`); the code is MIT.
