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

Read ALL of these files before generating any output. If missing, continue safely.

- seo-automation/outputs/intelligence-report/gsc-findings.json
- seo-automation/outputs/intelligence-report/ga4-findings.json
- seo-automation/outputs/intelligence-report/ranking-findings.json
- seo-automation/outputs/intelligence-report/odoo-findings.json
- seo-automation/outputs/intelligence-report/competitor-findings.json
- seo-automation/outputs/intelligence-report/algorithm-findings.json
- seo-automation/outputs/intelligence-report/research-findings.json
- seo-automation/outputs/intelligence-report/insights.json

If any file missing → DO NOT FAIL → use safe defaults.

---

## STEP 2 — Extract Real Values From Input Files

**From ga4-findings.json:**
- `organic_sessions_15d` = windows.15_day.organic_sessions
- `organic_sessions_90d` = windows.90_day.organic_sessions
- `organic_share_pct` = windows.90_day.organic_share_pct
- `traffic_trend` = traffic_trend_15d

**From odoo-findings.json:**
- `leads_mtd` = lead_summary.mtd.leads
- `mqls_mtd` = lead_summary.mtd.mqls
- `sqls_mtd` = lead_summary.mtd.sqls
- `lead_organic_share_pct` = lead_summary.organic_share_pct
- `performance_flag` = performance_flag

**From ranking-findings.json:**
- `climbers` = list of keyword strings from all_keywords where classification = "climber"
- `droppers` = list of keyword strings from all_keywords where classification = "dropper"
- `near_page_1` = list of keyword strings from near_page_1 array

**From gsc-findings.json:**
- `priority_1_pages` = priority_1_pages array (copy entire array — this is locked P1 input for SEO Strategist)

**From competitor-findings.json:**
- `highest_threat` = find the first competitor in the `competitors[]` array where `threat_level == "high_threat"`, use its `domain` value. If none found, use `competitors[0].domain`.
- `new_competitor_pages_count` = total count of `new_pages_this_cycle` entries across ALL competitors in the `competitors[]` array (sum the lengths)
- `top_content_gap` = `content_gaps[0].topic` + " — " + `content_gaps[0].recommended_action`

**From algorithm-findings.json:**
- `sprint_interrupt_required` = sprint_interrupt_required
- `volatility_level` = volatility_level

**From research-findings.json:**
- `research_findings` = extract a compact summary: for each finding in findings[], take question + finding + action. Include ALL 20 questions.

**performance_context:** Generate a 2–3 sentence plain-language explanation of MQL/SQL performance. If odoo-findings has `previous_sprint_actuals.performance_context`, copy it. Otherwise derive from: performance_flag + lead_summary + any algorithm event context from algorithm-findings.

**top_opportunity:** Derive from the top attack vector finding in research-findings (Q10 Competitor Position Table finding, or Q1 SERP opportunity) + most actionable near_page_1 keyword.

**priority_fix:** Derive from the first entry in gsc-findings.priority_1_pages signal text.

---

## STEP 3 — Create report-summary.json

Write to: `seo-automation/outputs/intelligence-report/report-summary.json`

Populate ALL fields with the real extracted values from Step 2. Do NOT leave any field as a default placeholder — replace every `0`, `"unknown"`, `[]`, and `{}` with real data from the input files.

```json
{
  "report_id": "biztechcs_intelligence_<generated_at>",
  "site": "BiztechCS",
  "mode": "mock",
  "report_type": "Intelligence Report",
  "generated_at": "<generated_at>",
  "top_opportunity": "<derived from research-findings Q10 + near_page_1>",
  "priority_fix": "<from gsc-findings priority_1_pages[0].signal>",
  "traffic_summary": {
    "organic_sessions_15d": "<from ga4-findings>",
    "organic_sessions_90d": "<from ga4-findings>",
    "organic_share_pct": "<from ga4-findings>",
    "traffic_trend": "<from ga4-findings>"
  },
  "lead_summary": {
    "leads_mtd": "<from odoo-findings>",
    "mqls_mtd": "<from odoo-findings>",
    "sqls_mtd": "<from odoo-findings>",
    "organic_share_pct": "<from odoo-findings>",
    "performance_flag": "<from odoo-findings>"
  },
  "priority_1_pages": "<copy priority_1_pages array from gsc-findings.json>",
  "ranking_summary": {
    "climbers": "<list from ranking-findings>",
    "droppers": "<list from ranking-findings>",
    "near_page_1": "<list from ranking-findings>"
  },
  "competitor_summary": {
    "highest_threat": "<from competitor-findings>",
    "new_competitor_pages_count": "<count from competitor-findings>",
    "top_content_gap": "<from competitor-findings content_gaps[0]>"
  },
  "algorithm_status": {
    "sprint_interrupt_required": "<from algorithm-findings>",
    "volatility_level": "<from algorithm-findings>"
  },
  "research_findings": "<compact summary object: {Q1: {finding, action}, Q2: {finding, action}, ... Q20: {finding, action}} from research-findings.json>",
  "performance_context": "<2-3 sentence plain-language MQL/SQL explanation>"
}
```

---

## STEP 4 — Create intelligence-report.md

Write to: `seo-automation/outputs/intelligence-report/intelligence-report.md`

Use this structure. Populate every section with real data from the input files.

```markdown
# BiztechCS SEO Intelligence Report — <generated_at>

## Executive Summary
- Organic sessions (90d): <value> | Trend: <value>
- Organic share: <value>%
- MQLs MTD: <value> | vs target: <comparison>
- Algorithm status: <volatility_level> — <sprint_interrupt note>

## Priority 1 Pages (Locked — must address this sprint)
<list each priority_1_pages entry with URL, signal, and required action>

## Lead Flow Dashboard
| Window | Leads | MQLs | SQLs |
|--------|-------|------|------|
| MTD    | <val> | <val>| <val>|
| QTD    | <val> | <val>| <val>|
| YTD    | <val> | <val>| <val>|

Performance flag: <performance_flag>
<performance_context paragraph>

## Rankings & Traffic
**Climbers (90d):** <list>
**Declining (90d):** <list>
**Near page 1 (positions 11–20):** <list>

## Algorithm Update Status
MozCast: <score> (<level>)
<sprint_interrupt_assessment>
<serp_observations key points>

## Competitor Watch
<For each HIGH threat competitor: new pages, new backlinks with domain types, strategic signals>
<Content gaps identified>

## 20 Research Questions — Key Findings
<For each Q1–Q20: one line with question category, finding, and action>

## GSC Insights Flags
<For each flag in gsc-findings.gsc_insights_flags: type, query, message, url. If gsc_insights_flags is empty or missing, write "No GSC flags this cycle.">
```

---

## STEP 5 — Create intelligence-report.html

Write to: `seo-automation/outputs/intelligence-report/intelligence-report.html`

Render the same content as the .md but as a styled HTML document suitable for PDF generation via Puppeteer. Use inline CSS only. Structure:

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>BiztechCS SEO Intelligence Report — <date></title>
<style>
  body { font-family: 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; color: #222; line-height: 1.6; }
  h1 { color: #1a1a2e; border-bottom: 3px solid #0066cc; padding-bottom: 8px; }
  h2 { color: #0066cc; margin-top: 32px; }
  h3 { color: #333; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { background: #0066cc; color: white; padding: 8px 12px; text-align: left; }
  td { padding: 8px 12px; border-bottom: 1px solid #ddd; }
  .p1 { background: #fff3cd; border-left: 4px solid #ff6600; padding: 12px 16px; margin: 8px 0; }
  .ok { color: #28a745; font-weight: bold; }
  .warn { color: #dc3545; font-weight: bold; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 0.85em; font-weight: bold; }
  .tag-high { background: #dc3545; color: white; }
  .tag-med { background: #fd7e14; color: white; }
  .tag-ok { background: #28a745; color: white; }
</style>
</head>
<body>
  <!-- Cover -->
  <h1>BiztechCS — SEO Intelligence Report</h1>
  <p><strong>Date:</strong> <date> | <strong>Prepared by:</strong> SEO Automation Engine | <strong>Mode:</strong> MOCK</p>

  <!-- All sections from Step 4 converted to HTML -->
  <!-- Use <div class="p1"> for Priority 1 alerts -->
  <!-- Use tables for Lead Flow, Rankings tables -->
  <!-- Use <span class="tag tag-high"> for HIGH threat labels -->
</body>
</html>
```

Populate the full HTML with all data. The HTML must be complete and renderable by Puppeteer — no missing sections, no placeholder text.

---

## End Condition

All three files written:
- `seo-automation/outputs/intelligence-report/report-summary.json` — all fields populated from real input data
- `seo-automation/outputs/intelligence-report/intelligence-report.md` — all 6 sections complete
- `seo-automation/outputs/intelligence-report/intelligence-report.html` — complete styled HTML

Reply ONLY with:
`✅ report-summary.json + intelligence-report.md + intelligence-report.html written`
