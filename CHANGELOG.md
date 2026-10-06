# Changelog

All notable changes. Format based on [Keep a Changelog](https://keepachangelog.com/); versions follow [SemVer](https://semver.org/).

## [0.2.0] — Unreleased

### Added
- `scripts/check_distractor_bias.py`: scripted anti-bias gate (length, length ratio, position), with unit tests and CI.
- `scripts/check_theme_contrast.py`: WCAG contrast in light and dark, dark-block sync, and white-on-video-poster contrast.
- `scripts/scan_publish_safety.py`: secrets, personal paths, private storage keys, real exam names in course content.
- `scripts/browser_smoke_test.mjs`: Playwright test of every slide, quizzes, mock exam, theme, 400px width, narration viewport.
- Theme toggle (auto / light / dark) in the engine, persisted per course.
- Three original themes, all system-font and contrast-validated in light and dark: `neutral` (default), `harbor` (sand, teal, serif headings), `graphite` (grey, violet, squared corners).
- `course.config.js`: one config file for title, brand, blueprint label, storage key, exam settings and disclaimer.
- Content-rights reference, rights-record template and a three-gate sharing process in the skill.
- MIT licence, content/audio licence notes, NOTICE, CONTRIBUTING, CI and Pages workflows.

### Changed
- The engine is now certification-agnostic: no exam-specific strings, domains or timings in `app.js`.
- The demo course is a fictional "incident management" exam with original content, replacing any real-exam material.
- `index.html` is a valid standalone page; structure (`engine.css`) and look (`themes/`) are separate.
- Default look is neutral; a brand theme is optional.

### Fixed
- Video poster gradient used a theme-inverting token; it now uses a dedicated `--poster-a` token.

## [0.1.0]
- First version of the skill (private).
