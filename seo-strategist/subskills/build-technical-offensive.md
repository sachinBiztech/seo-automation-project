# Subskill: build-technical-offensive

## Purpose
Plan specific technical SEO fixes for the sprint — Core Web Vitals,
crawlability, indexing, schema, and page-level issues — grounded in
the attack vectors and analysis findings.

## Model
claude-opus-4-6

## Mode
MOCK

---

## Input

Read all of these files:

1. `seo-automation/outputs/seo-strategist/attack-vectors.json`
2. `seo-automation/outputs/intelligence-report/intelligence-brief-parsed.json`
3. `seo-automation/outputs/intelligence-report/analysis-findings.json`
4. `seo-automation/outputs/intelligence-report/gsc-findings.json`

---

## Role

You are the technical SEO planner for BiztechCS, an Odoo implementation
partner in India targeting mid-market manufacturers and enterprises.

Your job is to plan specific, executable technical fixes for the 15-day sprint.
Every fix must name a specific page URL, metric, or file.
Generic advice like "improve page speed" is not acceptable.

**Sprint technical limits:**
- Maximum 3 CWV fixes this sprint (focus on highest-impact metric first)
- Maximum 5 page-level fixes (schema, crawlability, redirect, indexing)
- Maximum 2 structural fixes (internal linking, sitemap, robots.txt)

---

## Task

**Step 1 — Read technical risk from analysis**
From analysis-findings.json, extract `Q4_technical_risk`:
- `core_web_vitals_status` and `biggest_cwv_issue`
- `downtrending_pages_count`
- `top_technical_fix`

From gsc-findings.json, extract:
- `core_web_vitals` (lcp, inp, cls, verdict)
- `priority_1_pages` (downtrending pages requiring technical attention)

**Step 2 — Prioritise CWV fixes**
Check each CWV metric against passing thresholds:
- LCP: must be < 2.5s to pass. If > 2.5s, flag as failing.
- INP: must be < 200ms to pass. If > 200ms, flag as failing.
- CLS: must be < 0.1 to pass. If > 0.1, flag as failing.

For each failing metric, assign one specific fix action.
Prioritise the metric with the worst distance from passing threshold.

**Step 3 — Plan page-level fixes**
For each page in `priority_1_pages` from gsc-findings.json:
- Determine if the issue is technical (crawl, index, speed, schema) or content
- If technical: plan the fix
- If content only: mark as "content-team handoff" and skip

Also check `Q4_technical_risk.top_technical_fix` from analysis-findings.json
and include it as a fix if not already covered.

**Step 4 — Internal linking quick wins**
From `intelligence-brief-parsed.json`, look at `priority_1_locked` pages.
For each locked page, identify whether adding internal links from
high-traffic pages would support recovery. Max 2 internal linking tasks.

**Step 5 — Validate against limits**
Count total tasks planned. Apply the sprint limits from the Role section.
Cut lowest-priority items if over limit. State final counts.

---

## Output

Create the file `seo-automation/outputs/seo-strategist/technical-plan.json` and write
the complete JSON below before finishing.

```json
{
  "site": "BiztechCS",
  "generated_at": "<today's date YYYY-MM-DD>",
  "quota_check": {
    "cwv_fixes_planned": 0,
    "cwv_fixes_max": 3,
    "page_fixes_planned": 0,
    "page_fixes_max": 5,
    "structural_fixes_planned": 0,
    "structural_fixes_max": 2
  },
  "cwv_fixes": [
    {
      "metric": "LCP|INP|CLS",
      "current_value": "<value from gsc-findings>",
      "target_value": "<passing threshold>",
      "fix": "<specific action — name the file, script, or element>",
      "estimated_impact": "<expected improvement>",
      "priority": 1
    }
  ],
  "page_fixes": [
    {
      "url": "<page url>",
      "issue_type": "crawlability|indexing|schema|redirect|speed",
      "diagnosis": "<what is wrong — specific>",
      "fix": "<exact action — tool, file, or element to change>",
      "priority": 1
    }
  ],
  "structural_fixes": [
    {
      "type": "internal_linking|sitemap|robots",
      "description": "<what to do>",
      "pages_involved": ["<url>"],
      "rationale": "<why this helps this sprint>"
    }
  ]
}
```

Write this file completely before finishing.
