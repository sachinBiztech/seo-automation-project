# Subskill: pull-ga4-data

## Purpose
Extract organic traffic and conversion data from GA4 mock data.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK — read from local JSON file

---

## Input

File: `seo-automation/mock-data/ga4-mock.json`

---

## Task

You are an analytics data processor for BiztechCS.

Read `seo-automation/mock-data/ga4-mock.json` completely.

Then extract the following:

**Step 1 — Traffic Windows**
From `windows`, extract all three time windows: `15_day`, `90_day`, `180_day`.
For each, record: organic_sessions, total_sessions, conversions.
Calculate `organic_share_pct` = organic_sessions / total_sessions × 100 (round to 1 decimal).

**Step 2 — Traffic Trend**
Compare `15_day.organic_sessions` against the 15-day slice of `90_day`:
- 90-day average per 15 days = `90_day.organic_sessions / 6`
- If 15-day is > average: trend = "above_average"
- If 15-day is < average: trend = "below_average"
- If within 5%: trend = "on_track"

**Step 3 — Top Landing Pages**
Extract all entries from `top_landing_pages`.
For each, record: url, sessions_90d, bounce_rate.
Flag pages with bounce_rate > 0.50 as "high_bounce".

---

## Output

Create the file `seo-automation/outputs/ga4-findings.json` and write
the complete JSON below before finishing.

```json
{
  "site": "BiztechCS",
  "pulled_at": "<copy pulled_at from input>",
  "windows": {
    "15_day": {
      "organic_sessions": 0,
      "total_sessions": 0,
      "conversions": 0,
      "organic_share_pct": 0.0
    },
    "90_day": {
      "organic_sessions": 0,
      "total_sessions": 0,
      "conversions": 0,
      "organic_share_pct": 0.0
    },
    "180_day": {
      "organic_sessions": 0,
      "total_sessions": 0,
      "conversions": 0,
      "organic_share_pct": 0.0
    }
  },
  "traffic_trend_15d": "above_average|below_average|on_track",
  "top_landing_pages": [
    {
      "url": "<url>",
      "sessions_90d": 0,
      "bounce_rate": 0.00,
      "flag": "high_bounce|ok"
    }
  ]
}
```
