# Build History Rationale

## Purpose
Pulls from previous sprint task sheets to identify what worked, what didn't, and what is being repeated with explicit justification. Prevents the engine from repeating failed tactics and ensures every repeated approach has a documented reason.

## Model
claude-sonnet-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/sprint-plan.json
- seo-automation/outputs/sprint-tasks-[previous_sprint_id].json (if exists)
- seo-automation/outputs/gsc-findings.json

## Task

### If no previous sprint data exists
Output a baseline note: "Sprint 1 — no prior history. All tactics are baseline run. Results will seed future rationale."

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
- `seo-automation/outputs/history-rationale.json`

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
