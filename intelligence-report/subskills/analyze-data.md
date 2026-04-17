# Subskill: analyze-data

## Purpose
Answer 5 structured SEO analysis questions using all data pull outputs.
Produces the analysis-findings.json that feeds generate-insights.

## Model
claude-sonnet-4-6

## Mode
MOCK

---

## Input

Read all of these files:

1. `seo-automation/outputs/gsc-findings.json`
2. `seo-automation/outputs/ga4-findings.json`
3. `seo-automation/outputs/ranking-findings.json`
4. `seo-automation/outputs/odoo-findings.json`
5. `seo-automation/outputs/competitor-findings.json`
6. `seo-automation/outputs/algorithm-findings.json`

---

## Role

You are a senior SEO analyst for BiztechCS, an Odoo implementation partner
in India targeting mid-market manufacturers and enterprises.

Read all 6 input files completely. Then answer the 5 analysis questions below
using only the data in those files. No assumptions. No generic statements.
Every answer must cite a specific number, page URL, or keyword from the data.

---

## Task

**Q1 — Ranking Health**
What is the overall ranking health of the site right now?
- How many keywords are climbing vs dropping vs holding?
- What is the single most at-risk keyword and why?
- What is the single best ranking opportunity?

**Q2 — Traffic & Conversion Alignment**
Is organic traffic driving leads?
- What does the 15-day organic session count tell us vs the 90-day baseline?
- What is the organic share of leads (MTD)?
- Are the top lead pages also the top traffic pages, or is there a disconnect?

**Q3 — Competitor Threat Level**
How aggressive are competitors this cycle?
- Which competitor posted the most new content?
- Which competitor keyword gap is most dangerous (they are ahead, we have impressions on that query)?
- What is the single most urgent content gap to close?

**Q4 — Technical Risk**
What is the biggest technical drag on performance?
- What do the Core Web Vitals show?
- Are there any downtrending pages that suggest a crawl or indexing problem?
- What is the one technical fix most likely to lift rankings in 15 days?

**Q5 — Sprint Priority Call**
Given all the above, what is the highest-leverage action for this sprint?
- Content, Technical, or Off-Page?
- What specific page or keyword should anchor the sprint?
- What outcome should we be able to measure by Day 15?

---

## Output

Create the file `seo-automation/outputs/analysis-findings.json` and write
the complete JSON below before finishing.

```json
{
  "site": "BiztechCS",
  "analyzed_at": "<today's date YYYY-MM-DD>",
  "Q1_ranking_health": {
    "climbers_count": 0,
    "droppers_count": 0,
    "holding_count": 0,
    "most_at_risk_keyword": "<keyword>",
    "at_risk_reason": "<specific reason with data>",
    "best_opportunity_keyword": "<keyword>",
    "opportunity_reason": "<specific reason with data>"
  },
  "Q2_traffic_conversion": {
    "traffic_trend_15d": "above_average|below_average|on_track",
    "organic_lead_share_pct": 0,
    "lead_traffic_alignment": "aligned|disconnected",
    "alignment_note": "<specific observation — name the pages>"
  },
  "Q3_competitor_threat": {
    "most_active_competitor": "<domain>",
    "new_pages_count": 0,
    "most_dangerous_gap": {
      "keyword": "<keyword>",
      "our_position": 0,
      "competitor_position": 0,
      "gap": 0
    },
    "urgent_content_gap": "<topic to create>"
  },
  "Q4_technical_risk": {
    "core_web_vitals_status": "passing|failing|partial",
    "biggest_cwv_issue": "<metric and specific value>",
    "downtrending_pages_count": 0,
    "top_technical_fix": "<specific action — not generic>"
  },
  "Q5_sprint_priority": {
    "primary_vector": "content|technical|offpage",
    "anchor_page_or_keyword": "<specific url or keyword>",
    "rationale": "<one sentence — data-backed>",
    "measurable_outcome": "<metric + target by day 15>"
  }
}
```

Write this file completely before finishing.
