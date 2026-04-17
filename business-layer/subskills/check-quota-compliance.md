# Check Quota Compliance

## Purpose
Verifies that every content type in the sprint plan is within the per-sprint limits defined in the business config. Hard limit — no auto-override.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

## Input
- seo-automation/outputs/enriched-sprint-plan.json
- seo-automation/business-layer/biztechcs-business-config.md

## Task

Read content quotas from business config. Count each content type in `enriched-sprint-plan.json`:

| Type | Count in plan | Max allowed |
|------|--------------|-------------|
| Blog posts | count | from config |
| Listicles | count | from config |
| Free backlinks | count | from config |
| Paid backlinks | count | from config |
| Quora answers | count | from config |
| Reddit posts | count | from config |
| LinkedIn articles | count | from config |

### Rules
- If count > max: `status: "over_limit"` — this is a HARD FAIL
- If count == max: `status: "at_limit"` — allowed, note it
- If count < max: `status: "within_limit"` — pass

Override rule: A quota override is accepted only if `override_reason` field is present in the sprint plan item. Log override in output.

## Output
- `seo-automation/outputs/quota-check.json`

Schema:
```json
{
  "sprint_id": "string",
  "verdict": "compliant | over_limit",
  "checks": [
    {
      "content_type": "string",
      "planned": 0,
      "max_allowed": 0,
      "status": "within_limit | at_limit | over_limit",
      "override_reason": "string | null"
    }
  ]
}
```
