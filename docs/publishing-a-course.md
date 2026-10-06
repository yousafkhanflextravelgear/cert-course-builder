# Publishing a course you built

This repository holds the **tool**. Courses built for real certifications belong in **their own** repository or site, after
passing the three gates.

## 1. Gate A and B: while building

`SKILL.md` makes Claude fill in `RIGHTS.md` before writing and keep to original wording. If the certifying body requires a
licence for third-party materials, Claude tells you at the start.

## 2. Gate C: before sharing

```bash
python skills/cert-course-builder/scripts/scan_publish_safety.py path/to/course       # must report 0 errors
python skills/cert-course-builder/scripts/check_distractor_bias.py path/to/course
python skills/cert-course-builder/scripts/check_theme_contrast.py path/to/course/themes/*.css
node   skills/cert-course-builder/scripts/browser_smoke_test.mjs   path/to/course
```

The scan reports as **errors**: secrets, personal paths (`/home/you/…`, `C:\Users\you\…`), a missing or un-namespaced
`storageKey`, real certification or exam-body names inside course content (`.js/.html/.css/.json`), and any pattern you
pass with `--deny` or list in a `.publish-denylist` file (one regex per line; the file is git-ignored). E-mail addresses
and files over 5 MB are **warnings**. Use `--allow-cert-names` for a private build, and `--strict` to fail on warnings.

Then confirm by hand: disclaimer filled in; blueprint version and date shown; required trademark acknowledgement present;
AI-voice and external-video notices present; licences for every font, icon, image and audio file recorded.

## 3. Choose licences for your course

The MIT licence in this repository covers the engine code only. Choose a licence for your own content (for example CC BY
4.0, or "all rights reserved" if you will sell it), and say so in the course repository.

## 4. Host it

See [deployment](deployment.md).

## Things that should stay private

- A course for a body that requires a licence you do not hold (ITIL is the usual example).
- Any course containing an item you remember from a real exam.
- Courses with a `storageKey` or branding tied to a private site.
