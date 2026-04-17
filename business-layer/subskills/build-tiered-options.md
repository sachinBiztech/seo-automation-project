# Build Tiered Options

## Purpose
Assembles the final validated task list into Priority 1 / Priority 2 / Optional tiers with per-item cost estimates. Flags budget overages if POC selects over allocation.

## Model
claude-sonnet-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/enriched-sprint-plan.json
- seo-automation/outputs/quota-check.json
- seo-automation/outputs/topic-territory-check.json
- seo-automation/outputs/guardrails-check.json
- seo-automation/business-layer/biztechcs-business-config.md

## Task

Start from `enriched-sprint-plan.json`. Remove all items flagged as:
- `out_of_territory` (from topic-territory-check)
- `blocked_items` (from guardrails-check)
- `over_limit` items that have no override_reason (from quota-check)

For remaining items, assign tiers based on sprint plan priority + business alignment:
- **Priority 1**: GSC downtrending pages, P1 content, all technical fixes, P1 off-page
- **Priority 2**: P2 content, supporting off-page tasks
- **Optional**: LinkedIn articles, Reddit, supplementary backlinks

For each item, estimate cost:
- Blog post (2500w): 1 content credit = from business config per-sprint budget
- Listicle (1500w): 0.6 content credits
- Technical fix: 0.5 technical credit
- Off-page outreach: 0.2 outreach credit
- Guest post: 1 outreach credit

Calculate:
- P1 total cost
- P1 + P2 total cost
- Full plan total cost
- Flag if full plan exceeds `per_sprint_budget` from config

## Output
- `seo-automation/outputs/tiered-sprint-options.json`

Schema:
```json
{
  "sprint_id": "string",
  "per_sprint_budget": 0,
  "tiers": {
    "priority_1": {
      "items": [{"title": "string", "type": "string", "cost_estimate": 0}],
      "total_cost": 0
    },
    "priority_2": {
      "items": [{"title": "string", "type": "string", "cost_estimate": 0}],
      "total_cost": 0
    },
    "optional": {
      "items": [{"title": "string", "type": "string", "cost_estimate": 0}],
      "total_cost": 0
    }
  },
  "full_plan_cost": 0,
  "budget_overage": false,
  "overage_amount": 0
}
```
