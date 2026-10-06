"""Tests for scripts/check_theme_contrast.py."""
import re
import subprocess
import sys

import pytest

import check_theme_contrast as ctc
from conftest import SCRIPTS, TEMPLATE

THEMES = sorted((TEMPLATE / "themes").glob("*.css"))


def test_contrast_known_values():
    assert ctc.contrast("#000000", "#FFFFFF") == pytest.approx(21.0, rel=1e-3)
    assert ctc.contrast("#FFFFFF", "#FFFFFF") == pytest.approx(1.0)
    assert ctc.contrast("#777777", "#FFFFFF") == pytest.approx(4.48, abs=0.02)  # the classic "just fails AA" grey


def test_three_digit_hex_is_understood():
    assert ctc.contrast("#000", "#fff") == pytest.approx(21.0, rel=1e-3)


@pytest.mark.parametrize("theme", THEMES, ids=lambda p: p.name)
def test_shipped_themes_pass(theme):
    fails, report = ctc.check_theme(theme)
    assert fails == [] and report


def test_there_is_a_neutral_default_and_it_is_the_one_index_html_links():
    assert (TEMPLATE / "themes" / "neutral.css").exists()
    assert 'href="themes/neutral.css"' in (TEMPLATE / "index.html").read_text()


def _mutate(tmp_path, old, new, only_first=False):
    css = (TEMPLATE / "themes" / "neutral.css").read_text()
    assert old in css
    out = tmp_path / "t.css"
    out.write_text(css.replace(old, new, 1 if only_first else -1))
    return out


def test_low_contrast_text_is_caught(tmp_path):
    t = _mutate(tmp_path, "--ink-3:#586880", "--ink-3:#B0B8C4", only_first=True)  # light-mode only
    fails, _ = ctc.check_theme(t)
    assert any("ink-3" in f and "light" in f for f in fails)


def test_dark_block_drift_is_caught(tmp_path):
    css = (TEMPLATE / "themes" / "neutral.css").read_text()
    # change one value in the explicit data-theme="dark" block only
    head, tail = css.split(':root[data-theme="dark"]', 1)
    tail = tail.replace("--ground:#0E1520", "--ground:#0E1521", 1)
    f = tmp_path / "drift.css"
    f.write_text(head + ':root[data-theme="dark"]' + tail)
    fails, _ = ctc.check_theme(f)
    assert any("out of sync" in x for x in fails)


def test_missing_token_is_caught(tmp_path):
    t = _mutate(tmp_path, "--accent-soft:#E2ECFA;", "", only_first=True)
    fails, _ = ctc.check_theme(t)
    assert any("missing tokens" in f for f in fails)


def test_cli_exit_codes(tmp_path):
    ok = subprocess.run([sys.executable, str(SCRIPTS / "check_theme_contrast.py"), "-q", *map(str, THEMES)], capture_output=True, text=True)
    assert ok.returncode == 0, ok.stdout + ok.stderr
    bad = tmp_path / "bad.css"
    bad.write_text(":root{--ink:#fff;--ground:#fff}")
    r = subprocess.run([sys.executable, str(SCRIPTS / "check_theme_contrast.py"), str(bad)], capture_output=True, text=True)
    assert r.returncode in (1, 2)


def test_engine_css_contains_no_colour_literals():
    """Colour belongs in themes. The structural stylesheet may use tokens, black scrims, and WHITE on the video poster
    (the poster is always a dark gradient; check_theme_contrast.py validates white text against it)."""
    css = (TEMPLATE / "engine.css").read_text()
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    literals = re.findall(r"#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)", css)
    allowed = re.compile(r"^(rgba\(\s*0\s*,\s*0\s*,\s*0\b.*|rgba\(\s*255\s*,\s*255\s*,\s*255\b.*|#fff|#ffffff)$", re.I)
    offenders = [l for l in literals if not allowed.match(l)]
    assert offenders == [], offenders[:5]


def test_poster_contrast_is_checked_and_can_fail(tmp_path):
    css = (TEMPLATE / "themes" / "neutral.css").read_text().replace("--poster-a:#17233A", "--poster-a:#E0E0E0")
    f = tmp_path / "pale.css"
    f.write_text(css)
    fails, _ = ctc.check_theme(f)
    assert any("poster" in x for x in fails)


@pytest.mark.parametrize("theme", THEMES, ids=lambda p: p.name)
def test_themes_make_no_third_party_requests(theme):
    """Shipped themes must work offline and leak nothing: no @import, no url(http…), no web-font loading."""
    css = re.sub(r"/\*.*?\*/", "", theme.read_text(), flags=re.S)
    assert "@import" not in css and not re.search(r"url\(\s*['\"]?https?:", css) and "@font-face" not in css


def test_there_are_at_least_three_distinct_themes():
    assert {t.name for t in THEMES} >= {"neutral.css", "harbor.css", "graphite.css"}
    assert len({t.read_text() for t in THEMES}) == len(THEMES)
