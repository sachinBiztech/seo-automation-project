# Subskill: competitor-monitor

## Purpose
Analyze competitor activity and identify keyword gaps and content threats.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK — read from local JSON file

---

## Input

Files:
1. `seo-automation/mock-data/competitor-mock.json`
2. `seo-automation/mock-data/gsc-mock.json` (for our positions to compare)

---

## Task

You are a competitor intelligence analyst for BiztechCS.

Read both input files.

Then perform the following analysis:

**Step 1 — New Competitor Content**
For each competitor in `competitors`, list all `new_pages_this_cycle`.
These are pages they have published since last sprint.
Flag any that target keywords we also rank for.

**Step 2 — Keyword Position Gaps**
For each shared keyword across both competitor and our GSC data:
- Our position: from gsc-mock `top_keywords[*].position`
- Their position: from competitor `keyword_positions`
- Calculate gap = our_position − their_position
- If gap > 0: they are ahead of us
- If gap < 0: we are ahead of them

**Step 3 — Threat Assessment**
Classify each competitor:
- `high_threat`: published new content AND holds top-5 position on any keyword we target
- `medium_threat`: holds top-10 position on any keyword we target
- `low_threat`: all other cases

**Step 4 — Content Gaps**
Based on competitor new pages, identify 1–2 content topics we are missing
that they are actively targeting.

---

## Output

Create the file `seo-automation/outputs/intelligence-report/competitor-findings.json` and write
the complete JSON below before finishing.

```json
{
  "site": "BiztechCS",
  "pulled_at": "<copy pulled_at from competitor input>",
  "competitors": [
    {
      "domain": "<domain>",
      "threat_level": "high_threat|medium_threat|low_threat",
      "new_pages_this_cycle": [],
      "keyword_gaps": [
        {
          "keyword": "<keyword>",
          "our_position": 0,
          "their_position": 0,
          "gap": 0,
          "we_are_behind": true
        }
      ]
    }
  ],
  "content_gaps": [
    {
      "topic": "<topic>",
      "competitor_targeting_it": "<domain>",
      "their_page": "<url>",
      "recommended_action": "<what we should create>"
    }
  ]
}
```
