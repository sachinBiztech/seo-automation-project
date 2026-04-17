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

- `seo-automation/outputs/sprint-approval.json`
- `seo-automation/outputs/sprint-plan.json`
- `seo-automation/outputs/tiered-sprint-options.json`

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

**Scheduling logic:**
- Day 1: All Technical fixes + all Off-Page outreach dispatched
- Days 2–5: P1 Content writing (distribute evenly)
- Days 5–7: P2 Content writing
- Days 8–10: Optional items
- Editing tasks: one day after paired writing task (dependency: writer must be Completed first)

### Step 4 — Write output files

Write `seo-automation/outputs/sprint-tasks-[sprint_id].json`:
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

Also write `seo-automation/outputs/sprint-tasks-[sprint_id].csv` with the same data in CSV format (headers match column names above).

### Step 5 — Send Telegram confirmation

Send Telegram message:
```
✅ Sprint task sheet ready — [sprint_start] to [sprint_end]
Total tasks: [N] | Technical: [N] | Content: [N] | Off-Page: [N]
P1: [N] | P2: [N] | Optional: [N]
File: seo-automation/outputs/sprint-tasks-[sprint_id].csv
```

## Output

- `seo-automation/outputs/sprint-tasks-[sprint_id].json`
- `seo-automation/outputs/sprint-tasks-[sprint_id].csv`
