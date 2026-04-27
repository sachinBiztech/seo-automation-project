# Subskill: pull-gsc-data

## Purpose
Extract and classify SEO insights from Google Search Console mock data.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK — read from local JSON file

---

## Input

File: `seo-automation/mock-data/gsc-mock.json`

---

## Task

You are an SEO data processor for BiztechCS.

Read the file `seo-automation/mock-data/gsc-mock.json` completely.

Then perform the following classifications:

**Step 1 — CTR Opportunities**
From `top_keywords`, find every keyword where:
- `impressions` > 1000 AND
- `ctr` < 0.015

For each match, record: query, impressions, ctr, position, trend.

**Step 2 — Quick Win Keywords**
From `top_keywords`, find every keyword where:
- `position` is between 8 and 20 (inclusive)

For each match, record: query, position, impressions, ctr, trend.

**Step 3 — Priority 1 Pages**
Extract every entry from `priority_1_pages` (NOT `downtrending_pages` — the field is `priority_1_pages`).
For each entry, produce:
- `url`: copy the `url` field directly
- `signal`: combine `gsc_insights_flag` + " — " + `reason` into one string
- `priority`: set to "HIGH"

**Step 4 — Raw Top Keywords**
Copy the full `top_keywords` array as-is for reference.

**Step 5 — GSC Insights Flags & Core Web Vitals**
Copy the `gsc_insights_flags` array as-is. If missing, write `[]`.
Copy the `core_web_vitals` object as-is. If missing, write `{}`.

---

## Output

Create the file `seo-automation/outputs/intelligence-report/gsc-findings.json` and write the following JSON to it.

Do not leave any field empty. If a list has no matching items, write an empty array `[]`.

```json
{
  "site": "BiztechCS",
  "pulled_at": "<copy pulled_at from input>",
  "priority_1_pages": [
    {
      "url": "<page url>",
      "signal": "<signal text>",
      "priority": "<priority level>"
    }
  ],
  "ctr_opportunities": [
    {
      "query": "<keyword>",
      "impressions": 0,
      "ctr": 0.000,
      "position": 0.0,
      "trend": "<trend>"
    }
  ],
  "quick_win_keywords": [
    {
      "query": "<keyword>",
      "position": 0.0,
      "impressions": 0,
      "ctr": 0.000,
      "trend": "<trend>"
    }
  ],
  "raw_top_keywords": [],
  "gsc_insights_flags": [],
  "core_web_vitals": {}
}
```

Write the complete populated JSON to disk at the path above before finishing.
