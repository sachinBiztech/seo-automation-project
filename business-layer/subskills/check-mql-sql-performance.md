# Check MQL/SQL Performance

## Purpose
Compares previous sprint's actual MQL/SQL numbers against the per-sprint target. Uses `performance_context` from the Intelligence Report to distinguish algorithmic events from strategy failures — prevents penalising strategy when a Google update caused the shortfall.

## Model
claude-sonnet-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/intelligence-report/report-summary.json
- seo-automation/outputs/post-approval/goal-alignment.json
- seo-automation/business-layer/biztechcs-business-config.md

## Task

From `report-summary.json`:
- Read `odoo_findings.leads_mtd`, `mql_mtd`, `sql_mtd`
- Read `performance_context` — plain-language explanation of any variance

From `goal-alignment.json`:
- Read `per_sprint_mql_target`

Compare actuals vs target:
- If shortfall AND `performance_context` mentions algorithm update or known event → classify as `external_factor`, not `strategy_failure`
- If shortfall AND no external factor → classify as `strategy_failure`
- If on-target or above → `on_track`

### Output
This is informational for the human POC — it appears in the Telegram message as context, not as a blocking check.

## Output
- `seo-automation/outputs/post-approval/mql-check.json`

Schema:
```json
{
  "sprint_id": "string",
  "previous_sprint_actuals": {
    "leads": 0,
    "mqls": 0,
    "sqls": 0
  },
  "per_sprint_targets": {
    "leads": 0,
    "mqls": 0,
    "sqls": 0
  },
  "variance": {
    "leads_pct": 0,
    "mqls_pct": 0,
    "sqls_pct": 0
  },
  "classification": "on_track | external_factor | strategy_failure",
  "performance_context": "string",
  "human_summary": "string"
}
```
