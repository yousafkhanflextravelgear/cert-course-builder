# cert-course-builder

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Content: CC BY 4.0](https://img.shields.io/badge/demo%20content-CC%20BY%204.0-lightgrey.svg)](CONTENT-LICENSE.md)

**A Claude skill that builds interactive exam-prep courses for professional certifications, and proves they are fit to share.**

You name a certification. The skill researches its current blueprint, designs a course with applied case studies, writes
quizzes and a timed mock exam, adds narration and videos, then runs automated checks before anything is published: answer
bias, colour contrast, viewport stability in a real browser, and a scan for secrets, private data and content-rights
problems.

> Independent project. Not affiliated with or endorsed by any certifying body. The demo uses a **fictional** exam and
> contains no real exam content. See [NOTICE](NOTICE.md).

## What is interesting here

| | |
|---|---|
| **A scripted anti-bias gate** | Hand-written multiple-choice questions leak answers through length. `check_distractor_bias.py` measures it. The demo's first draft failed it (55% of correct answers were the longest option, against 25% by chance) and was rewritten until it passed (24%). Details in [assessment design](docs/assessment-design.md). |
| **Contrast you can prove** | `check_theme_contrast.py` checks WCAG ratios for every token pair in light and dark, keeps the two dark blocks in sync, and checks video-poster text. It found that a real brand palette failed AA on 15 pairs. |
| **Narration that never moves the page** | A browser test drives the engine with a stubbed speech engine, scrolls mid-narration and fails on any movement. A planted regression was confirmed to fail it. |
| **A rights gate, not an afterthought** | The skill refuses to use real exam items, links rather than copies blueprints, tells you when a body requires a licence (ITIL), and ends with a publish-safety scan. See [content rights](docs/content-rights.md). |
| **Zero dependencies in the course** | Plain HTML, CSS and JS; inline-SVG charts; system fonts; three original themes (neutral, harbor, graphite); strict-CSP-safe; progress stays in the browser. |

## Quick start

**Try the demo course**

```bash
cd skills/cert-course-builder/reference-template
python3 -m http.server 8000      # open http://localhost:8000
```

**Live demo:** https://yousafkhanflextravelgear.github.io/cert-course-builder/ (published from `reference-template/` by CI on every change; to host your own fork, set *Settings → Pages → Source → GitHub Actions*).

**Use the skill with Claude**

Either copy `skills/cert-course-builder/` into your Claude skills folder (for Claude Code: `~/.claude/skills/`), or
install it as a plugin:

```
/plugin marketplace add yousafkhanflextravelgear/cert-course-builder
/plugin install cert-course-builder@cert-course-builder
```

Then ask, for example:

> Build an exam-prep course for the *<certification>* exam.

The skill asks which certification if you have not said, researches the current blueprint, checks the body's content and
trademark rules, builds the course from the template and reports the results of every check.

**Run the checks yourself**

```bash
pip install -r requirements-dev.txt
python -m pytest -q
python skills/cert-course-builder/scripts/check_distractor_bias.py skills/cert-course-builder/reference-template
python skills/cert-course-builder/scripts/check_theme_contrast.py skills/cert-course-builder/reference-template/themes/*.css
python skills/cert-course-builder/scripts/scan_publish_safety.py .
npm i --no-save playwright && npx playwright install chromium
node skills/cert-course-builder/scripts/browser_smoke_test.mjs
```

## Current results (demo course)

| Check | Result |
|---|---|
| Unit tests (`pytest`) | 49 passed |
| Distractor bias | pass: longest-correct 24% (limit 40%), length ratio 1.02× (limit 1.20×), positions A/B/C/D = 9/9/9/11 |
| Theme contrast | pass: 3 themes × light and dark, 258 ratio checks including video-poster text |
| Publish-safety scan | 0 errors, 0 warnings |
| Browser smoke test | 9/9: 32 slides, 6 quizzes, 24-question mock exam, theme, 400px width, narration viewport, strict CSP |

CI runs all of the above on every push.

## Repository layout

```
skills/cert-course-builder/
  SKILL.md                   instructions Claude follows (8-step build + three rights gates)
  references/                content-rights checklist, per-course rights record
  scripts/                   check_distractor_bias.py · check_theme_contrast.py · scan_publish_safety.py
                             browser_smoke_test.mjs · dump_questions.js
  reference-template/        course engine + fictional demo course (themes/, course.config.js, seg*.js, exam-bank.js)
tests/                       pytest suites for the Python scripts
docs/                        architecture · assessment design · narration & audio · theming · content rights ·
                             publishing a course · deployment
.github/workflows/           ci.yml · pages.yml
```

## Documentation

[Architecture](docs/architecture.md) · [Assessment design](docs/assessment-design.md) ·
[Narration & audio](docs/narration-audio.md) · [Theming](docs/theming.md) · [Content rights](docs/content-rights.md) ·
[Publishing a course](docs/publishing-a-course.md) · [Deployment](docs/deployment.md) · [Changelog](CHANGELOG.md) ·
[Contributing](CONTRIBUTING.md)

## Licensing

Code: [MIT](LICENSE). Demo course text and documentation: CC BY 4.0. No audio, video, font or logo is bundled. Courses you
build are yours and carry their own rights questions: see [CONTENT-LICENSE](CONTENT-LICENSE.md) and
[NOTICE](NOTICE.md).
