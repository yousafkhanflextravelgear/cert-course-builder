"""Tests for scripts/check_distractor_bias.py: it must catch real bias, and must not cry wolf."""
import json
import random
import shutil
import subprocess
import sys

import pytest

import check_distractor_bias as cdb
from conftest import SCRIPTS, TEMPLATE


def make_bank(n, correct_len, wrong_len, positions):
    """n four-option questions; the correct option has `correct_len` chars, the others `wrong_len`."""
    qs = []
    for i in range(n):
        a = positions[i % len(positions)]
        opts = [("w%d-%d " % (i, k)).ljust(wrong_len, "x") for k in range(4)]
        opts[a] = ("c%d " % i).ljust(correct_len, "x")
        qs.append({"opts": opts, "a": a, "id": f"T{i}"})
    return qs


def run(qs, **kw):
    norm = cdb.normalise(qs)
    args = dict(max_longest=0.40, max_ratio=1.20, max_position=0.40, min_n=20, group_min_n=12)
    args.update(kw)
    return cdb.evaluate(norm, **args)


# --- the failure the check exists for -------------------------------------------------------------
def test_flags_correct_answer_that_is_always_longest():
    res = run(make_bank(40, correct_len=90, wrong_len=60, positions=[0, 1, 2, 3]))
    assert res["failures"]
    assert any("longest" in f for f in res["failures"])
    assert res["scopes"]["ALL"]["longest_rate"] == 1.0


def test_flags_ratio_even_when_not_always_longest():
    # correct is 1.5x the distractors on average; mix in some items where it is not the longest
    qs = make_bank(30, 90, 60, [0, 1, 2, 3]) + make_bank(10, 50, 60, [0, 1, 2, 3])
    res = run(qs, max_longest=0.99)
    assert any("x the length" in f for f in res["failures"])


def test_flags_position_clustering():
    res = run(make_bank(40, 60, 60, positions=[0, 0, 0, 1]))
    assert any("position A" in f for f in res["failures"])


# --- no false alarms ------------------------------------------------------------------------------
def test_balanced_bank_passes():
    rng = random.Random(7)
    qs = []
    for i in range(48):
        lens = [rng.randint(58, 72) for _ in range(4)]
        a = i % 4
        qs.append({"opts": [("o%d%d " % (i, k)).ljust(lens[k], "y") for k in range(4)], "a": a})
    res = run(qs)
    assert res["failures"] == [], res["failures"]


def test_ties_do_not_count_as_longest():
    res = run(make_bank(24, 60, 60, [0, 1, 2, 3]))
    assert res["scopes"]["ALL"]["longest_count"] == 0
    assert res["failures"] == []


def test_small_samples_are_reported_but_not_enforced():
    res = run(make_bank(8, 100, 50, [0, 1, 2, 3]))
    all_ = res["scopes"]["ALL"]
    assert all_["problems"] and not all_["enforced"]
    assert res["failures"] == []


def test_groups_are_judged_separately():
    biased = make_bank(15, 100, 50, [0, 1, 2, 3])
    fair = make_bank(15, 60, 60, [0, 1, 2, 3])
    for q in biased:
        q["group"] = "exam-bank"
    for q in fair:
        q["group"] = "quizzes"
    res = run(biased + fair)
    assert any(f.startswith("exam-bank:") for f in res["failures"])
    assert not any(f.startswith("quizzes:") for f in res["failures"])


def test_html_and_entities_are_stripped_before_measuring():
    qs = [{"opts": ["<b>aa</b>", "&amp;&amp;&amp;", "ccc", "dddd"], "a": 0}]
    norm = cdb.normalise(qs)
    assert [len(o) for o in norm[0]["opts"]] == [2, 3, 3, 4]


def test_rewrite_candidates_are_ranked_worst_first():
    qs = make_bank(30, 70, 60, [0, 1, 2, 3])
    qs[5]["opts"][qs[5]["a"]] = "z" * 150
    res = run(qs)
    assert res["rewrite_candidates"][0]["id"] == "T5"


# --- bad input is rejected loudly -----------------------------------------------------------------
@pytest.mark.parametrize("bad", [
    [{"opts": ["only one"], "a": 0}],
    [{"opts": ["a", "b"], "a": 5}],
    [{"opts": ["a", "b"], "a": "1"}],
    [{"opts": ["a", ""], "a": 0}],
    [{"opts": ["same", "SAME"], "a": 0}],
    [{"a": 0}],
])
def test_invalid_questions_raise(bad):
    with pytest.raises(ValueError):
        cdb.normalise(bad)


def test_binom_tail_matches_hand_values():
    assert cdb.binom_tail(4, 0, 0.25) == pytest.approx(1.0)
    assert cdb.binom_tail(4, 4, 0.25) == pytest.approx(0.25 ** 4)
    assert cdb.binom_tail(10, 10, 0.5) == pytest.approx(1 / 1024)


# --- CLI ------------------------------------------------------------------------------------------
def cli(*args):
    return subprocess.run([sys.executable, str(SCRIPTS / "check_distractor_bias.py"), *map(str, args)], capture_output=True, text=True)


def test_cli_exit_codes_on_json_input(tmp_path):
    bad = tmp_path / "bad.json"
    bad.write_text(json.dumps({"questions": make_bank(40, 90, 60, [0, 1, 2, 3])}))
    good = tmp_path / "good.json"
    good.write_text(json.dumps(make_bank(40, 60, 60, [0, 1, 2, 3])))
    assert cli(bad).returncode == 1
    assert cli(good).returncode == 0
    assert cli(tmp_path / "missing.json").returncode == 2
    junk = tmp_path / "junk.json"
    junk.write_text("not json")
    assert cli(junk).returncode == 2


def test_cli_json_report_is_machine_readable(tmp_path):
    f = tmp_path / "q.json"
    f.write_text(json.dumps(make_bank(24, 60, 60, [0, 1, 2, 3])))
    out = cli(f, "--json")
    data = json.loads(out.stdout)
    assert data["failures"] == [] and data["scopes"]["ALL"]["n"] == 24


# --- integration: the shipped demo course must pass its own gate ----------------------------------
@pytest.mark.skipif(not shutil.which("node"), reason="Node.js needed to load course data")
def test_reference_template_passes_the_gate():
    out = cli(TEMPLATE)
    assert out.returncode == 0, out.stdout + out.stderr


@pytest.mark.skipif(not shutil.which("node"), reason="Node.js needed to load course data")
def test_dump_reads_exam_bank_quizzes_and_checks():
    qs = cdb.load_questions(TEMPLATE)
    groups = {q["group"] for q in qs}
    assert {"exam-bank", "quizzes"} <= groups
    assert sum(q["group"] == "exam-bank" for q in qs) >= 20
