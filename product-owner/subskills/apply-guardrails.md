# Apply Guardrails

## Purpose
Applies CANNOT / FLAG rules from the product owner config to the enriched sprint plan. Hard-blocks any tactic that violates a CANNOT rule. Flags items needing human review.

## Model
claude-sonnet-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/enriched-sprint-plan.json
- seo-automation/product-owner/biztechcs-product-owner-config.md

## Task

Read `guardrails` section from product owner config. Apply to every item in the enriched sprint plan:

### Rule types
- **CANNOT**: Hard block. Remove the item from the plan. Log in `blocked_items`.
- **FLAG**: Soft block. Keep the item but add to `flagged_items` for human review. Do not auto-remove.
- **CAN**: Explicitly permitted. No action needed.

### Check surfaces
- Content titles and primary keywords
- Competitor claims and outreach angles
- Author assignments
- Backlink target domains (check against CANNOT domains list)
- Off-page content angles

### Output rules
- If any CANNOT violations: note them but continue (they'll be removed from final plan)
- Human review is required only for FLAG items — do not escalate CANNOT items (just remove them)
- Log every rule applied and its result

## Output
- `seo-automation/outputs/guardrails-check.json`

Schema:
```json
{
  "sprint_id": "string",
  "blocked_items": [
    {"item": "string", "reason": "string", "rule": "string"}
  ],
  "flagged_items": [
    {"item": "string", "reason": "string", "rule": "string"}
  ],
  "passed_items": 0,
  "total_items": 0
}
```
