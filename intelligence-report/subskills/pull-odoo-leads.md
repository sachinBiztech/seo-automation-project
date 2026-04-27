# Subskill: pull-odoo-leads

## Purpose
Extract CRM lead and MQL/SQL data to understand organic conversion performance.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK — read from local JSON file

---

## Input

File: `seo-automation/mock-data/odoo-leads-mock.json`

---

## Task

You are a CRM data processor for BiztechCS.

Read `seo-automation/mock-data/odoo-leads-mock.json` completely.

Then produce the following:

**Step 1 — Lead Summary**
Extract MTD, QTD, YTD lead/MQL/SQL counts.
Extract `organic_share_pct`.

**Step 2 — MQL Conversion Rate**
Calculate: `mql_rate_mtd` = mtd.mqls / mtd.leads × 100 (round to 1 decimal).
Calculate: `sql_rate_mtd` = mtd.sqls / mtd.leads × 100 (round to 1 decimal).

**Step 3 — Top Lead Pages**
Extract all entries from `top_lead_pages`.
For each, calculate: `mql_conversion_rate` = mqls_90d / leads_90d × 100 (round to 1 decimal).

**Step 4 — Performance Flag**
Compare MTD leads against QTD average per month (qtd.leads / 3).
- If MTD > QTD monthly avg: flag = "above_target"
- If MTD < QTD monthly avg by more than 20%: flag = "below_target"
- Otherwise: flag = "on_track"

---

## Output

Create the file `seo-automation/outputs/intelligence-report/odoo-findings.json` and write
the complete JSON below before finishing.

```json
{
  "site": "BiztechCS",
  "pulled_at": "<copy pulled_at from input>",
  "lead_summary": {
    "mtd": { "leads": 0, "mqls": 0, "sqls": 0 },
    "qtd": { "leads": 0, "mqls": 0, "sqls": 0 },
    "ytd": { "leads": 0, "mqls": 0, "sqls": 0 },
    "organic_share_pct": 0
  },
  "conversion_rates": {
    "mql_rate_mtd": 0.0,
    "sql_rate_mtd": 0.0
  },
  "top_lead_pages": [
    {
      "url": "<url>",
      "leads_90d": 0,
      "mqls_90d": 0,
      "mql_conversion_rate": 0.0
    }
  ],
  "performance_flag": "above_target|on_track|below_target"
}
```
