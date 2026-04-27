# Check Topic Territory

## Purpose
BiztechCS-specific: enforces that all content stays within approved topic territory — Odoo ERP, AI, Product Engineering. Removes out-of-territory items and flags them.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

## Input
- seo-automation/outputs/post-approval/enriched-sprint-plan.json
- seo-automation/business-layer/biztechcs-business-config.md

## Task

Read `topic_territory` from business config. For BiztechCS, the approved territory is:
- Odoo ERP (implementation, customization, modules, upgrades)
- AI + automation (Odoo AI features, process automation)
- Product Engineering (custom development, integrations)

For every content item and attack vector in the enriched sprint plan:
1. Classify as `in_territory` or `out_of_territory`
2. If `out_of_territory`: mark for removal from plan
3. If borderline: classify as `flag` and note it

### Classification logic
- Primary keyword clearly maps to approved territory → in_territory
- Primary keyword is generic (e.g., "CRM software") without Odoo context → flag
- Primary keyword targets a different technology stack (Salesforce, SAP) → out_of_territory

Note: For other websites (PrintXpand, CRMJetty, AppJetty), this check is quantity-only — no territory enforcement.

## Output
- `seo-automation/outputs/post-approval/topic-territory-check.json`

Schema:
```json
{
  "sprint_id": "string",
  "site": "BiztechCS",
  "verdict": "compliant | violations_found",
  "items": [
    {
      "title": "string",
      "primary_keyword": "string",
      "classification": "in_territory | flag | out_of_territory",
      "note": "string"
    }
  ]
}
```
