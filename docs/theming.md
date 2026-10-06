# Theming

The default look is `themes/neutral.css`: system fonts only (no web-font requests), a neutral blue accent, light and dark.
Two further original looks ship as examples: `themes/harbor.css` (warm sand, deep teal, serif headings) and `themes/graphite.css` (cool grey, violet, squared corners). All three use system fonts only.

## How a theme works

A theme file declares tokens in three blocks:

```css
:root { … }                                                                  /* light */
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } } /* dark: OS preference */
:root[data-theme="dark"] { … }                                               /* dark: in-app toggle */
```

The two dark blocks **must be identical**. The Theme button cycles auto → light → dark by setting `data-theme`.

Required tokens: surfaces (`--ground`, `--surface`, `-2`, `-3`), text (`--ink`, `-2`, `-3`), rules, accent trio, callout
colours (`--tip`, `--upd`, `--trap`, `--key`, each with `-soft`), result colours (`--ok`, `--bad`, each with `-soft`),
domain hues `--d0…--d5`, `--poster-a` (a dark base for video posters), `--shadow`, `--f-display`, `--f-body`, `--f-mono`,
`--r`, `--pill`.

## Make your own

```bash
cp themes/neutral.css themes/mybrand.css       # change colour and font values only; keep every token name
python skills/cert-course-builder/scripts/check_theme_contrast.py themes/mybrand.css
# then point <link id="theme" href="themes/mybrand.css"> in index.html at it
```

## What the checker verifies

- Dark blocks are in sync.
- In light **and** dark: text pairs ≥ 4.5:1 (WCAG AA) and UI pairs ≥ 3:1, for every foreground/background combination the
  engine renders (ink on surfaces, accent on surfaces, accent-ink on accent, callout text on its tint, …).
- White video-poster text ≥ 4.5:1 on `--poster-a` and on each hue blended into it.

Brand palettes often fail: a real-world cream/navy/teal palette that was tried while preparing this project failed AA on 15
light-mode pairs until its foreground colours were darkened. Run the checker on any palette before adopting it.

## Web fonts and privacy

Loading fonts from a third-party CDN sends each visitor's IP address to its operator. A Munich court (2022) found that
unlawful under German data-protection law where the font could be self-hosted. Self-host font files (check their
licence, e.g. SIL OFL) and declare them with `@font-face`. The neutral theme avoids the issue by using system fonts.
