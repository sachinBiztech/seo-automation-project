# Subskill: pull-ranking-data

## Purpose
Extract keyword ranking movements and classify performance trends.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK — read from local JSON file

---

## Input

File: `seo-automation/mock-data/rankings-mock.json`

---

## Task

You are a ranking data processor for BiztechCS.

Read `seo-automation/mock-data/rankings-mock.json` completely.

Then classify every keyword:

**Step 1 — Classify each keyword**
For each entry in `keywords`:
- Calculate `position_change` = pos_90d_ago − pos_now
  (positive = improved, negative = dropped)
- Classify:
  - `climber`: trend = Climbing AND position_change > 0
  - `dropper`: trend = Declining AND position_change < 0
  - `holding`: trend = Holding
  - `mixed`: trend says one thing but numbers say another

**Step 2 — Identify near-page-1 keywords**
Find all keywords where `pos_now` is between 11 and 20.
These are candidates to push to page 1 this sprint.

**Step 3 — Identify at-risk keywords**
Find all keywords where trend = "Declining".
These need defensive action.

---

## Output

Create the file `seo-automation/outputs/ranking-findings.json` and write
the complete JSON below before finishing.

```json
{
  "site": "BiztechCS",
  "pulled_at": "<copy pulled_at from input>",
  "all_keywords": [
    {
      "keyword": "<keyword>",
      "pos_now": 0,
      "pos_90d_ago": 0,
      "position_change": 0,
      "trend": "<trend>",
      "classification": "climber|dropper|holding|mixed"
    }
  ],
  "near_page_1": [
    {
      "keyword": "<keyword>",
      "pos_now": 0,
      "positions_to_page_1": 0
    }
  ],
  "at_risk": [
    {
      "keyword": "<keyword>",
      "pos_now": 0,
      "pos_90d_ago": 0,
      "drop": 0
    }
  ]
}
```
