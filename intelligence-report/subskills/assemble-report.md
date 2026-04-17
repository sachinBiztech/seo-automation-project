# Subskill: assemble-report

## Purpose
Combine all data into final outputs:
- report-summary.json (machine)
- intelligence-report.md (human)
- intelligence-report.html (for PDF / fallback)

## Model
claude-sonnet-4-6

## Mode
MOCK

---

## STEP 1 — Read Inputs

Read these files (if missing, continue safely):

- seo-automation/outputs/gsc-findings.json
- seo-automation/outputs/ga4-findings.json
- seo-automation/outputs/ranking-findings.json
- seo-automation/outputs/odoo-findings.json
- seo-automation/outputs/competitor-findings.json
- seo-automation/outputs/algorithm-findings.json
- seo-automation/outputs/research-findings.json
- seo-automation/outputs/insights.json

If any file missing:
→ DO NOT FAIL
→ Use safe defaults

---

## STEP 2 — Prepare Safe Values

Set defaults:

- generated_at = today (YYYY-MM-DD)
- report_id = biztechcs_intelligence_<generated_at>

Fallback values:

- top_opportunity = "No major opportunity detected"
- priority_fix = "No critical fix identified"
- organic_sessions_15d = 0
- performance_flag = "on_track"

---

## STEP 3 — Create report-summary.json

Write file:

seo-automation/outputs/report-summary.json

```json
{
  "report_id": "biztechcs_intelligence_<generated_at>",
  "site": "BiztechCS",
  "mode": "mock",
  "report_type": "Intelligence Report",
  "generated_at": "<generated_at>",
  "top_opportunity": "<top_opportunity>",
  "priority_fix": "<priority_fix>",
  "traffic_summary": {
    "organic_sessions_15d": <organic_sessions_15d>,
    "organic_sessions_90d": 0,
    "organic_share_pct": 0,
    "traffic_trend": "on_track"
  },
  "lead_summary": {
    "leads_mtd": 0,
    "mqls_mtd": 0,
    "sqls_mtd": 0,
    "organic_share_pct": 0,
    "performance_flag": "<performance_flag>"
  },
  "ranking_summary": {
    "climbers": [],
    "droppers": [],
    "near_page_1": []
  },
  "competitor_summary": {
    "highest_threat": "unknown",
    "new_competitor_pages_count": 0,
    "top_content_gap": "unknown"
  },
  "algorithm_status": {
    "sprint_interrupt_required": false,
    "volatility_level": "normal"
  },
  "research_findings": {},
  "performance_context": "No anomalies detected"
}