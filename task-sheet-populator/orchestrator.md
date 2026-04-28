# Task Sheet Populator

## Purpose
On human POC GO (sprint approved via Telegram), reads the approved sprint plan and populates the sprint task sheet with all tasks, scheduling, and metadata. Status starts as "Not Started". GSC downtrending pages appear first, flagged Priority: HIGH.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

---

## OUTPUT DISCIPLINE — CRITICAL

- Use the write tool to save all output files to disk.
- Do NOT print file contents to the screen.
- Do NOT summarize or explain after saving.
- Reply ONLY with: `✅ sprint-tasks-[sprint_id].json + sprint-tasks-[sprint_id].csv written — [N] tasks`

---

## Input

- `seo-automation/outputs/seo-strategist/sprint-approval.json`
- `seo-automation/outputs/seo-strategist/sprint-plan.json`
- `seo-automation/outputs/post-approval/tiered-sprint-options.json`

---

## Task

### Step 1 — Verify approval
Read `sprint-approval.json`. If `status` is not `"approved"`: STOP. Do not generate task sheet.
Extract: `sprint_id`, `sprint_start`, `sprint_end`.

### Step 2 — Read sprint plan and tiered options
Read `sprint-plan.json` for all task items.
Read `tiered-sprint-options.json` for P1/P2/Optional classification.

### Step 3 — Build task rows

For each task, create a row with these columns:

| Column | Value |
|--------|-------|
| sr | sequential number starting at 1 |
| taskType | Technical \| Content \| Off-Page |
| title | task title or target URL |
| priority | P1 \| P2 \| Optional \| HIGH (GSC downtrending) |
| assignedAgent | technical-seo \| content-writer \| offpage-outreach |
| scheduledDay | Day 1–10 (see scheduling logic below) |
| status | Not Started |
| authorOwner | named author (Content tasks) or agent name |
| started | "" |
| completed | "" |
| driveLink | "" |
| notes | context, keywords, fix details, vector reference |

**GSC downtrending pages** (from `sprint-plan.json.priority_1_pages`): create as first rows, `priority: "HIGH"`.

**Scheduling logic (per Parth's concept — Priority overlay: P1 → Days 1–5 | P2 → Days 5–9 | Optional → Days 8–10):**

- Day 1: ALL Technical fixes + ALL Off-Page outreach dispatched (regardless of priority)
- Content tasks — use SEPARATE counters per priority level (NOT a shared counter):
  - P1 content: counter starts at 0 → Day = min(2 + counter×2, 5). Cap at Day 5.
    - P1 task 0 → Day 2 | P1 task 1 → Day 4 | P1 task 2+ → Day 5
  - P2 content: counter starts at 0 → Day = min(5 + counter×2, 9). Cap at Day 9.
    - P2 task 0 → Day 5 | P2 task 1 → Day 7 | P2 task 2 → Day 9
  - Optional content: counter starts at 0 → Day = min(8 + counter×2, 10). Cap at Day 10.
    - Optional task 0 → Day 8 | Optional task 1 → Day 10
- NO task ever assigned beyond Day 10. If a cap is hit, all overflow tasks get the cap day.
- Process content tasks in priority order (P1 first, then P2, then Optional) when building rows.

### Step 4 — Write output files

Write `seo-automation/outputs/sprint-pm/sprint-tasks-[sprint_id].json`.
CRITICAL: The top-level array key MUST be `"tasks"` — never `"items"`.
```json
{
  "sprint_id": "string",
  "sprint_start": "YYYY-MM-DD",
  "sprint_end": "YYYY-MM-DD",
  "generated_at": "ISO8601",
  "total_tasks": 0,
  "tasks": [
    {
      "sr": 1,
      "taskType": "string",
      "title": "string",
      "priority": "string",
      "assignedAgent": "string",
      "scheduledDay": "Day 1",
      "status": "Not Started",
      "authorOwner": "string",
      "started": "",
      "completed": "",
      "driveLink": "",
      "notes": "string"
    }
  ]
}
```

Also write `seo-automation/outputs/sprint-pm/sprint-tasks-[sprint_id].csv` with the same data in CSV format (headers match column names above).

### Step 5 — Send Telegram confirmation

Send Telegram message:
```
✅ Sprint task sheet ready — [sprint_start] to [sprint_end]
Total tasks: [N] | Technical: [N] | Content: [N] | Off-Page: [N]
P1: [N] | P2: [N] | Optional: [N]
File: seo-automation/outputs/sprint-pm/sprint-tasks-[sprint_id].csv
```

## Output

- `seo-automation/outputs/sprint-pm/sprint-tasks-[sprint_id].json`
- `seo-automation/outputs/sprint-pm/sprint-tasks-[sprint_id].csv`
