# Architecture

## Two layers

1. **The skill** (`skills/cert-course-builder/SKILL.md`): instructions that tell Claude how to research a certification,
   design a course, write assessments, check them and decide whether the result may be shared.
2. **The engine** (`skills/cert-course-builder/reference-template/`): a dependency-free course player written in plain
   HTML, CSS and JavaScript. Claude copies it and fills in content.

The scripts in `skills/cert-course-builder/scripts/` sit between them: they are the quality gates the skill runs while
it builds, and that CI runs on the demo.

```
repo
├─ skills/cert-course-builder/
│  ├─ SKILL.md                 the instructions Claude follows
│  ├─ references/              content-rights checklist + per-course rights record
│  ├─ scripts/                 bias, contrast, publish-safety checks; browser smoke test
│  └─ reference-template/      engine + fictional demo course
├─ tests/                      pytest suites for the three Python scripts
├─ docs/                       these pages
└─ .github/workflows/          CI (tests, gates, browser) and Pages demo deploy
```

## Engine files

| File | Role | Edited per course? |
|---|---|---|
| `index.html` | Shell: topbar, course-map rail, stage, transcript, dock; script and theme links | Theme link only |
| `engine.css` | Structure and layout. **No colours or fonts**, only tokens | No |
| `themes/*.css` | Design tokens: light block plus two identical dark blocks | Choose or copy one |
| `app.js` | Engine: slide renderers, quizzes, exam, narration, progress, theme toggle | No |
| `course.config.js` | Title, brand, blueprint label, storage key, exam settings, disclaimer | **Yes** |
| `data-core.js` | `BLUEPRINT` (domains, competencies, weights), icons, authoring helpers (`H.*`) | Replace `BLUEPRINT` |
| `seg0.js … segN.js` | Course content: segments → modules → slides | **Yes** |
| `exam-bank.js` | Mock-exam questions | **Yes** |
| `audio-manifest.js` | Optional: recorded narration index | Generated |

Scripts load in order: config, data-core, segments, exam bank, (audio manifest), `app.js`.

## Data model

```
COURSE.segments[]  { id, code, label, title, hue, q, modules[] }
  modules[]        { code, title, slides[] }
    slides[]       { type?, title, html | scenario/prompts | items | cards | id…, narr }
BLUEPRINT[]        { d, hue, name, min, max, comps: [[code, statement, short, min, max]…] }
EXAM_BANK[]        { d, c, q, opts[], a, why }          a = index of the correct option before shuffling
```

Slide `type`: omitted (content), `opener`, `case`, `quiz`, `check`, `flash`, `video`, `exam`, `blueprint`.
Each slide has `narr`, its narration script, which is also the transcript.

## Design decisions

- **No build step, no dependencies.** The course runs from any static host and from a single saved file. A learner's
  course must keep working in five years.
- **Structure and look are separate.** Tokens in `themes/` can be validated mechanically (contrast, dark/light sync).
- **Config over code.** Nothing exam-specific lives in `app.js`; a test greps the engine CSS for stray colours and the
  scanner flags real exam names in content.
- **Videos open in a new window.** No iframes: works under strict Content-Security-Policy hosts and avoids embedding
  terms.
- **Safe failure for audio.** Recorded narration is looked up by a positional key and a text hash; any mismatch silently
  falls back to the device voice instead of playing the wrong clip.
- **Progress stays on the device.** Everything is in `localStorage` under the course's own key; nothing is sent anywhere.
