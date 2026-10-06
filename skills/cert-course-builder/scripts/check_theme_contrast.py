#!/usr/bin/env python3
"""Validate a course theme stylesheet: WCAG contrast in light AND dark, and light/dark block sync.

A theme file (themes/*.css) defines design tokens in three blocks:

    :root { ... }                                                     light tokens
    @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }   dark, automatic
    :root[data-theme="dark"] { ... }                                  dark, explicit toggle

The last two MUST declare identical tokens (one serves OS preference, the other the in-app theme
button). This script checks that, then measures contrast for every foreground/background token pair
the engine actually renders. Exit status: 0 = all pass, 1 = failures, 2 = bad input.

    python check_theme_contrast.py themes/neutral.css [themes/other.css ...] [--min 4.5] [--min-ui 3.0]
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# (foreground token, background token, role). role "text" uses --min, "ui" uses --min-ui.
PAIRS = [
    ("ink", "ground", "text"), ("ink", "surface", "text"), ("ink", "surface-2", "text"),
    ("ink", "surface-3", "text"), ("ink", "accent-soft", "text"),
    ("ink-2", "surface", "text"), ("ink-2", "surface-2", "text"),
    ("ink-3", "surface", "text"), ("ink-3", "surface-2", "text"), ("ink-3", "ground", "text"),
    ("surface", "ink", "text"),  # toast, pressed buttons
    ("accent", "surface", "text"), ("accent", "ground", "text"),
    ("accent-ink", "accent", "text"),  # primary button label
    ("accent", "surface", "ui"),  # focus ring
    ("tip", "tip-soft", "text"), ("trap", "trap-soft", "text"),
    ("upd", "upd-soft", "text"), ("key", "key-soft", "text"),
    ("ok", "ok-soft", "text"), ("bad", "bad-soft", "text"),
    ("ok", "surface", "text"), ("bad", "surface", "text"), ("tip", "surface", "text"),
    ("d0", "surface", "text"), ("d1", "surface", "text"), ("d2", "surface", "text"),
    ("d3", "surface", "text"), ("d4", "surface", "text"), ("d5", "surface", "text"),
    ("d0", "surface-2", "text"), ("d1", "surface-2", "text"), ("d2", "surface-2", "text"),
    ("d3", "surface-2", "text"), ("d4", "surface-2", "text"), ("d5", "surface-2", "text"),
]
REQUIRED = sorted({t for a, b, _ in PAIRS for t in (a, b)})
HEX = re.compile(r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")


def _block(css: str, opener: str) -> str | None:
    """Return the text between the braces that follow `opener`, honouring nesting."""
    start = css.find(opener)
    if start < 0:
        return None
    i = css.find("{", start)
    depth, j = 0, i
    while j < len(css):
        depth += css[j] == "{"
        depth -= css[j] == "}"
        if depth == 0:
            return css[i + 1 : j]
        j += 1
    return None


def _tokens(body: str) -> dict[str, str]:
    body = re.sub(r"/\*.*?\*/", "", body, flags=re.S)
    return {m.group(1): m.group(2).strip() for m in re.finditer(r"--([a-z0-9-]+)\s*:\s*([^;]+);", body)}


def parse_theme(css: str) -> dict[str, dict[str, str]]:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    light = _block(css, ":root{") or _block(css, ":root {")
    media = _block(css, "@media (prefers-color-scheme:dark)") or _block(css, "@media (prefers-color-scheme: dark)")
    auto = _block(media, ":root:not([data-theme=\"light\"])") if media else None
    explicit = _block(css, ':root[data-theme="dark"]')
    if light is None or auto is None or explicit is None:
        missing = [n for n, v in (("light :root", light), ("dark @media block", auto), ('dark :root[data-theme="dark"]', explicit)) if v is None]
        raise ValueError("theme is missing block(s): " + ", ".join(missing))
    return {"light": _tokens(light), "dark-auto": _tokens(auto), "dark": _tokens(explicit)}


def _rgb(value: str) -> tuple[float, float, float]:
    if not HEX.match(value):
        raise ValueError(f"colour token is not a hex value: {value!r}")
    h = value.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))  # type: ignore[return-value]


def luminance(value: str) -> float:
    def lin(c: float) -> float:
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = (lin(c) for c in _rgb(value))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(fg: str, bg: str) -> float:
    a, b = luminance(fg), luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


POSTER_TEXT = "#FFFFFF"  # video posters always use white text on a dark gradient (engine.css .v-poster)
HUES = [f"d{i}" for i in range(6)]


def blend(a: str, b: str, wa: float) -> str:
    """sRGB mix like CSS color-mix(in srgb, a wa%, b): returns '#RRGGBB'."""
    ra, rb = _rgb(a), _rgb(b)
    return "#" + "".join(f"{round((wa * x + (1 - wa) * y) * 255):02X}" for x, y in zip(ra, rb))



def check_theme(path: Path, min_text: float = 4.5, min_ui: float = 3.0) -> tuple[list[str], list[str]]:
    """Return (failures, report_lines)."""
    fails: list[str] = []
    report: list[str] = []
    try:
        modes = parse_theme(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        return [f"{path}: {e}"], []

    if modes["dark-auto"] != modes["dark"]:
        diff = sorted(k for k in set(modes["dark-auto"]) | set(modes["dark"]) if modes["dark-auto"].get(k) != modes["dark"].get(k))
        fails.append(f"{path.name}: dark blocks out of sync (media-query vs data-theme=\"dark\") on: {', '.join(diff)}")

    for mode in ("light", "dark"):
        tok = modes[mode]
        absent = [t for t in REQUIRED if t not in tok]
        if absent:
            fails.append(f"{path.name} [{mode}]: missing tokens: {', '.join(absent)}")
            continue
        for fg, bg, role in PAIRS:
            need = min_text if role == "text" else min_ui
            try:
                ratio = contrast(tok[fg], tok[bg])
            except ValueError as e:
                fails.append(f"{path.name} [{mode}] --{fg}/--{bg}: {e}")
                continue
            ok = ratio >= need
            report.append(f"{'ok  ' if ok else 'FAIL'} {path.name:<14} {mode:<5} --{fg:<10} on --{bg:<11} {ratio:5.2f}:1 (need {need})")
            if not ok:
                fails.append(f"{path.name} [{mode}] --{fg} on --{bg}: {ratio:.2f}:1 < {need}")
        # video poster: white text over linear-gradient(--poster-a -> 55% --hue / 45% --poster-a)
        if "poster-a" in tok:
            ends = {"poster-a": tok["poster-a"], **{f"poster-a+{h}": blend(tok[h], tok["poster-a"], 0.55) for h in HUES if h in tok}}
            for name, colour in ends.items():
                ratio = contrast(POSTER_TEXT, colour)
                ok = ratio >= min_text
                report.append(f"{'ok  ' if ok else 'FAIL'} {path.name:<14} {mode:<5} poster text on {name:<14} {ratio:5.2f}:1 (need {min_text})")
                if not ok:
                    fails.append(f"{path.name} [{mode}] white poster text on {name} ({colour}): {ratio:.2f}:1 < {min_text}")
        else:
            fails.append(f"{path.name} [{mode}]: missing token --poster-a (video posters need a dark base)")
    return fails, report


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("themes", nargs="+", type=Path)
    ap.add_argument("--min", type=float, default=4.5, dest="min_text", help="minimum ratio for text pairs (default 4.5, WCAG AA)")
    ap.add_argument("--min-ui", type=float, default=3.0, help="minimum ratio for UI-component pairs (default 3.0)")
    ap.add_argument("-q", "--quiet", action="store_true", help="only print failures")
    args = ap.parse_args(argv)

    all_fails: list[str] = []
    for p in args.themes:
        fails, report = check_theme(p, args.min_text, args.min_ui)
        if not args.quiet:
            print("\n".join(report))
        all_fails += fails
    if all_fails:
        print("\nTHEME CHECK FAILED", file=sys.stderr)
        for f in all_fails:
            print(f"  - {f}", file=sys.stderr)
        return 1
    print(f"\nTHEME CHECK PASSED ({len(args.themes)} theme file(s), light + dark)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
