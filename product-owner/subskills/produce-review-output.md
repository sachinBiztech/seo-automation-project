# Produce Review Output

## Purpose
Assembles alignment check, guardrails check, and enrichment into a final Product Owner verdict: APPROVED (with enrichment notes) or REVISION_REQUIRED (with structured revision instructions for SEO Strategist).

## Model
claude-opus-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/post-approval/alignment-check.json
- seo-automation/outputs/post-approval/competitor-claims-check.json
- seo-automation/outputs/post-approval/guardrails-check.json
- seo-automation/outputs/post-approval/enriched-sprint-plan.json

## Task

### CRITICAL: Blocked vs Flagged — these are NOT the same

`guardrails-check.blocked_items` — Hard violations of CANNOT rules. These BLOCK the plan.
`guardrails-check.flagged_items` — Human awareness notes ONLY. These are NOT blocking. Do NOT treat flagged items as revision requests.

If `blocked_items` is an empty array `[]`, that is a PASS — no guardrail violations exist.
Do NOT promote flagged items into blocked items. They are separate fields for a reason.

### Decision logic

**APPROVED** if ALL of:
- `alignment-check.verdict` is `"aligned"` or `"aligned_with_notes"`
- `guardrails-check.blocked_items` is an empty array `[]`
- `competitor-claims-check.overall` is NOT `"has_contradictions"`

**REVISION_REQUIRED** if ANY of:
- `alignment-check.verdict` is `"misaligned"`
- `guardrails-check.blocked_items` has one or more entries (array length > 0)
- `competitor-claims-check.overall` is `"has_contradictions"`

**If none of the REVISION_REQUIRED conditions are met → verdict MUST be `approved`.**

### On APPROVED
- Compile all enrichment notes from `enriched-sprint-plan.json`
- Copy `flagged_items` from `guardrails-check.json` into `flagged_for_human_awareness` (they are awareness-only, not blockers)
- Set `revision_count` to 0 (or read from previous review JSON if it exists)
- Set `revision_requests` to empty array `[]`

### On REVISION_REQUIRED
- Write specific, actionable revision instructions (not vague notes)
- Each instruction: what to change, which item, why
- Pass back to SEO Strategist orchestrator

### Reform loop cap
Read `revision_count` from previous `product-owner-review.json`. If `revision_count >= 3`:
- Set `verdict: "escalate_to_human"`
- Send Telegram: "⚠️ Product Owner: 3 revision cycles failed for [sprint_id]. Human review required."

## Output
- `seo-automation/outputs/post-approval/product-owner-review.json`

Schema:
```json
{
  "sprint_id": "string",
  "verdict": "approved | revision_required | escalate_to_human",
  "revision_count": 0,
  "enrichment_notes": ["string"],
  "flagged_for_human_awareness": ["string"],
  "revision_requests": [
    {"item": "string", "instruction": "string", "reason": "string"}
  ],
  "reviewed_at": "ISO8601"
}
```
