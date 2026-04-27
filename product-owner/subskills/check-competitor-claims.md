# Check Competitor Claims

## Purpose
Verifies specific competitor claims made in the sprint plan (e.g., "competitor launched new content on X"). Prevents the strategy from acting on stale or incorrect competitor intelligence.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

## Input
- seo-automation/outputs/seo-strategist/sprint-plan.json
- seo-automation/outputs/intelligence-report/competitor-findings.json

## Task

Extract all competitor claims from `sprint-plan.json`:
- `attack_vectors[*].competitor_context`
- Any competitor references in rationale fields

For each claim:
1. Cross-reference against `competitor-findings.json` (from Intelligence Report)
2. Check if the claim matches a recorded finding (domain, action, date)
3. In PRODUCTION mode: spot-check via Agent-Browser on the competitor URL

### Verification rules
- VERIFIED: claim matches a finding in competitor-findings.json with matching domain + action
- UNVERIFIED: no matching finding — note it but do not block (WARNING only)
- CONTRADICTED: competitor-findings.json shows the opposite — FLAG for revision

### Mock mode
In MOCK mode: mark all claims as VERIFIED if a matching competitor domain appears in competitor-findings.json, regardless of action details.

## Output
- `seo-automation/outputs/post-approval/competitor-claims-check.json`

Schema:
```json
{
  "sprint_id": "string",
  "claims": [
    {
      "vector_number": 1,
      "claim": "string",
      "status": "verified | unverified | contradicted",
      "source": "string",
      "note": "string"
    }
  ],
  "overall": "all_verified | has_unverified | has_contradictions"
}
```
