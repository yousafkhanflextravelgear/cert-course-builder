#!/usr/bin/env python3
"""Check a question bank for the two "test-wise" tells that make multiple-choice items guessable.

  1. LENGTH BIAS   - the correct option is disproportionately the longest one. Unchecked first drafts
                     commonly show 80%+; chance for four options is 25%. Runtime shuffling does NOT hide this.
  2. POSITION BIAS - the correct answer clusters in one slot (e.g. always "A"). The engine shuffles options per
                     session, so learners never see authored positions, but a skewed bank usually signals
                     careless authoring, so it is still checked.

Usage
    python check_distractor_bias.py <course-dir>            # directory holding index.html (needs Node.js)
    python check_distractor_bias.py questions.json          # [{"opts": [...], "a": 0}, ...] or {"questions": [...]}
Options
    --max-longest 0.40     fail if the correct option is strictly longest in more than this share
    --max-ratio 1.20       fail if mean(len(correct) / mean(len(distractors))) exceeds this
    --max-position 0.40    fail if one position holds the correct answer more often than this share
    --min-n 20             minimum questions in the whole bank before ALL is enforced
    --group-min-n 12       minimum questions in a group (exam-bank, quizzes, ...) before it is enforced
    --json                 machine-readable report on stdout
Groups smaller than the minimum are reported but not enforced: a handful of items cannot prove bias.
Exit status: 0 pass, 1 bias found, 2 bad input.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import subprocess
import sys
from collections import Counter, defaultdict
from math import comb
from pathlib import Path

HERE = Path(__file__).resolve().parent


# --------------------------------------------------------------------------- loading
def _plain(text: str) -> str:
    """Option text as a learner reads it: no tags, entities decoded, whitespace collapsed."""
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", str(text)))).strip()


def normalise(raw: list[dict]) -> list[dict]:
    qs: list[dict] = []
    for i, q in enumerate(raw):
        where = q.get("id") or q.get("source") or f"#{i + 1}"
        opts = q.get("opts")
        a = q.get("a")
        if not isinstance(opts, list) or len(opts) < 2:
            raise ValueError(f"{where}: needs at least two options in 'opts'")
        if not isinstance(a, int) or isinstance(a, bool) or not 0 <= a < len(opts):
            raise ValueError(f"{where}: 'a' must be the index (0..{len(opts) - 1}) of the correct option, got {a!r}")
        texts = [_plain(o) for o in opts]
        if any(not t for t in texts):
            raise ValueError(f"{where}: empty option text")
        if len(set(t.lower() for t in texts)) != len(texts):
            raise ValueError(f"{where}: duplicate option text")
        qs.append({"id": where, "group": q.get("group", "questions"), "d": q.get("d"), "opts": texts, "a": a})
    return qs


def load_questions(target: Path) -> list[dict]:
    if target.is_dir():
        node = shutil.which("node")
        if not node:
            raise ValueError("Node.js is required to read a course directory; install it or pass a JSON file instead")
        proc = subprocess.run([node, str(HERE / "dump_questions.js"), str(target)], capture_output=True, text=True, timeout=60)
        if proc.returncode != 0:
            raise ValueError(f"could not load course: {proc.stderr.strip() or 'unknown error'}")
        data = json.loads(proc.stdout)
    else:
        try:
            data = json.loads(target.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as e:
            raise ValueError(f"cannot read {target}: {e}") from e
    raw = data["questions"] if isinstance(data, dict) else data
    if not isinstance(raw, list) or not raw:
        raise ValueError("no questions found")
    return normalise(raw)


# --------------------------------------------------------------------------- analysis
def binom_tail(n: int, k: int, p: float) -> float:
    """P(X >= k) for X ~ Binomial(n, p): how surprising `k` longest-correct items would be by chance."""
    return sum(comb(n, i) * p**i * (1 - p) ** (n - i) for i in range(k, n + 1))


def analyse(qs: list[dict]) -> dict:
    n = len(qs)
    longest = sum(1 for q in qs if len(q["opts"][q["a"]]) > max(len(o) for i, o in enumerate(q["opts"]) if i != q["a"]))
    ties = sum(1 for q in qs if len(q["opts"][q["a"]]) == max(len(o) for o in q["opts"]) and
               sum(len(o) == len(q["opts"][q["a"]]) for o in q["opts"]) > 1)
    ratios = []
    for q in qs:
        others = [len(o) for i, o in enumerate(q["opts"]) if i != q["a"]]
        ratios.append(len(q["opts"][q["a"]]) / (sum(others) / len(others)))
    chance = sum(1 / len(q["opts"]) for q in qs) / n
    pos = Counter(q["a"] for q in qs)
    top_pos, top_n = pos.most_common(1)[0]
    return {
        "n": n,
        "longest_count": longest,
        "longest_rate": longest / n,
        "tie_count": ties,
        "mean_length_ratio": sum(ratios) / n,
        "chance": chance,
        "longest_p_value": binom_tail(n, longest, chance),
        "position_counts": {int(k): pos[k] for k in sorted(pos)},
        "top_position": top_pos,
        "top_position_share": top_n / n,
    }


def evaluate(qs: list[dict], max_longest: float, max_ratio: float, max_position: float, min_n: int, group_min_n: int) -> dict:
    groups: dict[str, list[dict]] = defaultdict(list)
    for q in qs:
        groups[q["group"]].append(q)
    scopes = {"ALL": qs, **dict(sorted(groups.items()))}
    report, failures = {}, []
    for name, items in scopes.items():
        m = analyse(items)
        need = min_n if name == "ALL" else group_min_n
        m["enforced"] = m["n"] >= need
        m["min_n"] = need
        problems = []
        if m["longest_rate"] > max_longest:
            problems.append(f"correct option is the longest in {m['longest_rate']:.0%} of items ({m['longest_count']}/{m['n']}; chance ~{m['chance']:.0%}, limit {max_longest:.0%})")
        if m["mean_length_ratio"] > max_ratio:
            problems.append(f"correct option averages {m['mean_length_ratio']:.2f}x the length of the distractors (limit {max_ratio:.2f}x)")
        if m["top_position_share"] > max_position:
            problems.append(f"correct answer sits in position {'ABCDEFGH'[m['top_position']]} in {m['top_position_share']:.0%} of items (limit {max_position:.0%})")
        m["problems"] = problems
        report[name] = m
        if problems and m["enforced"]:
            failures += [f"{name}: {p}" for p in problems]
    # rewrite candidates: correct is strictly the longest, ranked by how much longer
    cands = []
    for q in qs:
        c = len(q["opts"][q["a"]])
        o = max(len(x) for i, x in enumerate(q["opts"]) if i != q["a"])
        if c > o:
            cands.append((c / o, q["id"], c, o))
    cands.sort(reverse=True)
    return {"scopes": report, "failures": failures, "rewrite_candidates": [{"id": i, "correct_len": c, "longest_distractor": o} for _, i, c, o in cands]}


# --------------------------------------------------------------------------- cli
def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("target", type=Path)
    ap.add_argument("--max-longest", type=float, default=0.40)
    ap.add_argument("--max-ratio", type=float, default=1.20)
    ap.add_argument("--max-position", type=float, default=0.40)
    ap.add_argument("--min-n", type=int, default=20)
    ap.add_argument("--group-min-n", type=int, default=12)
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args(argv)
    try:
        qs = load_questions(args.target)
    except ValueError as e:
        print(f"INPUT ERROR: {e}", file=sys.stderr)
        return 2
    result = evaluate(qs, args.max_longest, args.max_ratio, args.max_position, args.min_n, args.group_min_n)

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"{'scope':<12}{'n':>4}  {'longest':>9}  {'len ratio':>9}  {'top position':>14}  status")
        for name, m in result["scopes"].items():
            status = "not enforced (small sample)" if not m["enforced"] else ("FAIL" if m["problems"] else "ok")
            print(f"{name:<12}{m['n']:>4}  {m['longest_rate']:>8.0%}   {m['mean_length_ratio']:>8.2f}x  "
                  f"{'ABCDEFGH'[m['top_position']] + ' ' + format(m['top_position_share'], '.0%'):>14}  {status}")
        print("\nposition counts (ALL):", ", ".join(f"{'ABCDEFGH'[k]}={v}" for k, v in result["scopes"]["ALL"]["position_counts"].items()))
        for name, m in result["scopes"].items():
            if m["problems"] and not m["enforced"]:
                print(f"note: {name} shows {len(m['problems'])} pattern(s) but has only {m['n']} items (< {m['min_n']}), so it is not enforced")
        if result["failures"]:
            print("\nDISTRACTOR BIAS FOUND", file=sys.stderr)
            for f in result["failures"]:
                print(f"  - {f}", file=sys.stderr)
            top = result["rewrite_candidates"][:10]
            if top:
                print("  rewrite first (correct option is the longest): " + ", ".join(f"{c['id']} ({c['correct_len']} vs {c['longest_distractor']})" for c in top), file=sys.stderr)
        else:
            print("\nDISTRACTOR CHECK PASSED")
    return 1 if result["failures"] else 0


if __name__ == "__main__":
    sys.exit(main())
