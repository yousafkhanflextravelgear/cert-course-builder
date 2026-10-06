# Assessment design and the bias check

## Why it exists

Multiple-choice items leak their answers through form. The most common leak in drafted questions is **length**: the
correct option is written carefully and ends up longer, more specific and more hedged than the distractors. Test-wise
learners pick it without knowing the content. In unchecked first drafts the correct option is the longest in 55-80% of
items; with four options, chance is about 25%.

The engine shuffles option order per session (seeded, so stable within a sitting). That hides **position** bias from
learners but cannot hide **length** bias, so both are measured.

## What `check_distractor_bias.py` measures

| Metric | Limit | Meaning |
|---|---|---|
| Longest-correct rate | ≤ 40% | Share of items where the correct option is strictly longer than every distractor (ties do not count) |
| Mean length ratio | ≤ 1.20× | Average of `len(correct) / mean(len(distractors))` |
| Position share | ≤ 40% | Largest share of correct answers in any one authored position |

Lengths are measured on what a learner reads (HTML tags removed, entities decoded, whitespace collapsed). Scopes are the
whole bank, the mock-exam bank, the module quizzes and the end-of-domain checks. A scope is enforced only above a minimum
size (20 for the whole bank, 12 for a group) because a handful of items cannot prove bias; smaller scopes are reported
only. The report lists the items to rewrite first, ranked by how much longer the correct option is.

```bash
python skills/cert-course-builder/scripts/check_distractor_bias.py path/to/course   # reads the course via Node
python skills/cert-course-builder/scripts/check_distractor_bias.py questions.json  # [{"opts":[…],"a":0}, …]
python … --json                                                                    # machine-readable
```

Exit status: 0 pass, 1 bias found, 2 bad input.

### Result on the demo course

| Scope | Items | Longest-correct | Length ratio | Top position |
|---|---|---|---|---|
| All | 38 | 24% | 1.02× | D, 29% |
| Mock-exam bank | 24 | 25% | 1.03× | D, 29% |
| Module quizzes | 12 | 17% | 1.01× | C, 25% |

The first draft of the demo failed: 55% longest-correct overall (58% in the exam bank). The failing items were rewritten
until the gate passed. The thresholds were not changed.

## How to fix a flagged item

1. Lengthen a plausible distractor with a real qualifier, not filler.
2. Or tighten the correct option by removing hedges and repeated words.
3. Vary **which** option ends up longest. Making a distractor always the longest is just a different tell.
4. Re-run. Do not weaken the thresholds.

## Quizzes and exams

- **Module quiz:** a few applied questions; instant feedback with an explanation for *every* option.
- **End-of-domain check:** short, cumulative.
- **Mock exam:** question count, time and domain mix follow the real blueprint as closely as it allows; no feedback until
  submit; flag-for-review navigator; results by domain and competency with links back to modules; a scaled score only
  if the real exam publishes a scale (`exam.scaleNote` says honestly what the number means).
- **Originality:** questions come from public standards and general knowledge. Never from the real exam; see
  `skills/cert-course-builder/references/content-rights.md`.
