# Check Goal Alignment

## Purpose
Verifies the sprint plan serves the annual business goals (leads, MQLs, SQLs, revenue) divided by 26 sprints, adjusted for seasonality weights.

## Model
claude-sonnet-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/post-approval/enriched-sprint-plan.json
- seo-automation/business-layer/biztechcs-business-config.md
- seo-automation/outputs/intelligence-report/report-summary.json

## Task

From business config, calculate the per-sprint target slice:
- Annual goal ÷ 26 = per-sprint baseline
- Apply seasonality weight for current quarter (from config)
- Per-sprint target = baseline × seasonality_weight

For the current sprint plan, evaluate:
1. Does the content plan target keywords that serve the primary conversion paths?
2. Do attack vectors align with the top lead-generating pages (from `report-summary.json.priority_1_pages`)?
3. Does the off-page plan build authority for the top revenue-generating service areas?

### Alignment scoring
- Strong: ≥2 of 3 vectors directly serve annual goal
- Moderate: 1 of 3 vectors directly serves goal, others are supporting
- Weak: No vectors directly serve annual goal

### Output rules
- Weak alignment: add a note but do NOT block (WARNING only)
- Always include what the per-sprint MQL/lead target is

## Output
- `seo-automation/outputs/post-approval/goal-alignment.json`

Schema:
```json
{
  "sprint_id": "string",
  "per_sprint_lead_target": 0,
  "per_sprint_mql_target": 0,
  "seasonality_weight": 1.0,
  "alignment_score": "strong | moderate | weak",
  "notes": ["string"]
}
```
