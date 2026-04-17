# Subskill: pull-clarity-data

## Purpose
Extract Microsoft Clarity behavioural data: rage clicks, dead clicks, scroll depth, and session insights per page. Flags UX friction points that may be suppressing conversions on key landing pages.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK — read from local JSON file

---

## Input

File: `seo-automation/mock-data/clarity-mock.json`

---

## Task

You are a UX data processor for BiztechCS.

Read the file `seo-automation/mock-data/clarity-mock.json` completely.

Then perform the following classifications:

**Step 1 — Rage Click Pages**
From `pages`, find every page where `rage_clicks_pct` > 5.
For each match, record: url, rage_clicks_pct, likely_cause.

**Step 2 — Dead Click Pages**
From `pages`, find every page where `dead_clicks_pct` > 10.
For each match, record: url, dead_clicks_pct, likely_cause.

**Step 3 — Low Scroll Depth Pages**
From `pages`, find every page where `avg_scroll_depth_pct` < 40.
For each match, record: url, avg_scroll_depth_pct, interpretation.

**Step 4 — High Engagement Pages**
From `pages`, find every page where `avg_scroll_depth_pct` >= 70 AND `avg_session_duration_sec` >= 120.
These are content assets worth amplifying. Record: url, avg_scroll_depth_pct, avg_session_duration_sec.

**Step 5 — Summary Metrics**
Copy the `summary` object from the input as-is.

---

## Output

Create the file `seo-automation/outputs/clarity-findings.json` and write the following JSON to it.

Do not leave any field empty. If a list has no matching items, write an empty array `[]`.

```json
{
  "site": "BiztechCS",
  "pulled_at": "<copy pulled_at from input>",
  "mode": "mock",
  "rage_click_pages": [
    {
      "url": "<page url>",
      "rage_clicks_pct": 0.0,
      "likely_cause": "<description>"
    }
  ],
  "dead_click_pages": [
    {
      "url": "<page url>",
      "dead_clicks_pct": 0.0,
      "likely_cause": "<description>"
    }
  ],
  "low_scroll_pages": [
    {
      "url": "<page url>",
      "avg_scroll_depth_pct": 0,
      "interpretation": "<why users are leaving early>"
    }
  ],
  "high_engagement_pages": [
    {
      "url": "<page url>",
      "avg_scroll_depth_pct": 0,
      "avg_session_duration_sec": 0
    }
  ],
  "summary": {}
}
```

Write the complete populated JSON to disk at the path above before finishing.
