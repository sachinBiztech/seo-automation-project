# Build History Rationale

## Purpose
Pulls from previous sprint task sheets to identify what worked, what didn't, and what is being repeated with explicit justification. Prevents the engine from repeating failed tactics and ensures every repeated approach has a documented reason.

## Model
claude-sonnet-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/seo-strategist/sprint-plan.json
- seo-automation/outputs/intelligence-report/gsc-findings.json
- seo-automation/mock-data/previous-sprint-results-mock.json (MOCK mode — use this as previous sprint data)

## Task

### In MOCK mode
Read `seo-automation/mock-data/previous-sprint-results-mock.json` as the previous sprint data source.
This file contains completed tasks from sprint biztechcs_sprint_2026-04-01 with outcomes and verdicts.

Use the `verdict_for_section_10` field in each task as the primary source of validated/failed tactic notes.
Cross-reference with `seo-automation/outputs/intelligence-report/gsc-findings.json` for current position data to confirm outcomes.

### If previous sprint data exists

1. **Find completed tasks** from previous sprint: `status == "Done"`

2. **For technical tasks**: Cross-reference the fixed page with current GSC data. Did the fix recover the page?
   - RECOVERED: page impressions/position improved ≥10% post-fix → "Tactic validated"
   - NOT_RECOVERED: no improvement → "Tactic failed — do not repeat without diagnosis"
   - INCONCLUSIVE: cooldown still active → "In cooldown — awaiting 90-day verification"

3. **For content tasks**: Check if the published article ranks for its primary keyword.
   - RANKING: appears in GSC with impressions → "Content tactic validated"
   - NOT_RANKING: no GSC data for article → "Content indexed but no traction — review brief quality"

4. **For off-page tasks**: Log which outreach emails received replies.

5. **For current sprint plan**: Find any tactic that repeats a previous approach.
   - If the previous approach WORKED: note "Repeating validated tactic. [Evidence]."
   - If the previous approach FAILED: flag with "WARNING: Previously attempted and failed. Reason: [X]. Only proceed if new approach differs in: [specific change]."

## Output
- `seo-automation/outputs/seo-strategist/history-rationale.json`

Schema:
```json
{
  "sprint_id": "string",
  "previous_sprint_id": "string | null",
  "baseline_run": true,
  "validated_tactics": [{"tactic": "string", "evidence": "string"}],
  "failed_tactics": [{"tactic": "string", "reason": "string", "warning": "string"}],
  "repeated_with_justification": [{"tactic": "string", "justification": "string"}],
  "summary": "string"
}
```
