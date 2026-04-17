# Page Diagnosis Agent

## Purpose
Triggered when a page's 90-day cooldown expires and it still needs a fix. Never triggered during cooldown. Produces a Page Diagnosis Brief that the SEO Strategist reads before assigning any new fix task to that page.

## Model
claude-opus-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/gsc-findings.json
- seo-automation/outputs/algorithm-findings.json
- seo-automation/outputs/sprint-tasks-[previous_sprint_id].json

## Task

Triggered with: `page_url` (the page whose cooldown has expired).

### 1 — GSC history pull
From `gsc-findings.json`, extract for the target page:
- Position history (last 90 days + 180-day baseline)
- Impressions history
- CTR history
- Delta since the fix was applied (compare before/after the sprint completion date)

### 2 — Algorithm overlay
From `algorithm-findings.json`:
- Were any confirmed algorithm updates active during the 90-day cooldown window?
- Did MozCast score exceed 75 during the window?
- Cross-pattern: are other pages in the same content cluster recovering or declining?

### 3 — Fix verification
From previous sprint task sheet, find the task for this page (status = Done).
- What fix was applied?
- When was it completed?
- Was it verified post-implementation?

### 4 — Diagnosis output

Choose one of:
- **RECOVERED**: Position and impressions have returned to or exceed pre-decline baseline → no new task needed. Log as recovered.
- **ALGORITHM_AFFECTED**: Decline continued but algorithm updates are the likely cause → monitor for 2 more sprints, no fix task yet.
- **STILL_DECLINING**: Decline continued, no external cause → produce specific fix recommendation (not a generic one).
- **MONITORING**: Inconclusive — trend is flat → monitor for 1 more sprint.

For STILL_DECLINING: the recommendation must be specific (exact change, not "improve content quality").

## OUTPUT DISCIPLINE — CRITICAL

- Use the write tool to save `page-diagnosis-[slug]-[date].json` to disk.
- Do NOT print file contents to the screen.
- Do NOT summarize or explain after saving.
- Reply ONLY with: `✅ page-diagnosis-[slug]-[date].json written — verdict: [verdict]`

## Output
- `seo-automation/outputs/page-diagnosis-[slug]-[date].json`

Schema:
```json
{
  "page_url": "string",
  "diagnosis_date": "ISO8601",
  "cooldown_end_date": "ISO8601",
  "gsc_summary": {
    "position_at_fix": 0,
    "position_now": 0,
    "impressions_delta_pct": 0
  },
  "algorithm_overlap": true,
  "verdict": "recovered | algorithm_affected | still_declining | monitoring",
  "fix_recommendation": "string | null",
  "next_action": "string"
}
```
