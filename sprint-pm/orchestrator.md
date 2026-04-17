# Sprint PM Agent

## Purpose
Daily overnight agent. Reads the task sheet, calculates today's sprint day, triggers execution agents for today's tasks, handles missed-task rollover, and logs the daily run.

## Model
claude-sonnet-4-6

## Mode
MOCK

---

## OUTPUT DISCIPLINE — CRITICAL

- Use the write tool to save all output files to disk.
- Do NOT print file contents to the screen.
- Do NOT summarize or explain after saving.
- Reply ONLY with: `✅ sprint-pm-log-[date].json written — Day [N], [N] tasks triggered`

---

## HOW THIS ORCHESTRATOR WORKS

This agent runs all steps sequentially in its own context (no sessions_spawn needed — all steps are lightweight reads and writes). It reads the task sheet, determines today's tasks, updates statuses, and triggers execution agents via `openclaw agent` calls.

---

## Input

- `seo-automation/outputs/sprint-tasks-[sprint_id].json`
- `seo-automation/outputs/sprint-approval.json`

---

## Task

### Step 1 — Calculate sprint day
Read `sprint_start` from `sprint-approval.json`.
Calculate: `sprint_day = (today - sprint_start) in days + 1`
If `sprint_day > 10`: sprint is complete.
- Send Telegram: "🏁 Sprint [sprint_id] complete. Day 10 passed. All remaining tasks carried to next sprint as P1."
- Write log and stop.

### Step 2 — Read today's tasks
Filter `sprint-tasks-[sprint_id].json.tasks` where:
- `scheduledDay == "Day [N]"` AND `status == "Not Started"`

### Step 3 — Trigger execution agents

For each task in today's list, trigger the appropriate agent:

**Task Type = Technical:**
- Update task status to `"In Progress"`
- In MOCK mode: call `openclaw agent --agent technical-seo --message "Run technical fix for task [sr]: [title]. Sprint: [sprint_id]."`

**Task Type = Content:**
- Check dependency: if paired editing task exists for a writing task, ensure writing completes first
- Update task status to `"In Progress"` in `sprint-tasks-[sprint_id].json`
- Add this task title to your running `triggered_tasks` list
- In MOCK mode: call `openclaw agent --agent content-pipeline --message "Run content pipeline. Task ID: [sr], Sprint ID: [sprint_id]. Follow all steps in the content pipeline agent."`

**Task Type = Off-Page:**
- Update task status to `"In Progress"`
- In MOCK mode: call `openclaw agent --agent off-page-seo --message "Run off-page tasks for sprint [sprint_id]."`

### Step 4 — Check for missed tasks
Find tasks where `scheduledDay` is a day BEFORE today AND `status == "Not Started"`.
For each missed task:
- Change `scheduledDay` to tomorrow's day number
- Send Telegram: "⚠️ [N] tasks from Day [X] not started — reassigned to Day [N+1]"

### Step 5 — Dependency check
Find editing tasks where the paired writing task `status != "Completed"`.
For each held task:
- Set `status = "Held — dependency"`
- Send Telegram: "🔗 Task [sr] ([title]) held — waiting for [dependency task title] to complete."

### Step 6 — Write log

Throughout Steps 3–5 you MUST maintain three running lists in memory:
- `triggered_tasks`: task titles of every task you updated to "In Progress" in Step 3
- `reassigned_tasks`: task titles of every task you moved to a later day in Step 4
- `held_tasks`: task titles of every task you set to "Held — dependency" in Step 5

Write `seo-automation/outputs/sprint-pm-log-[date].json` using the write tool:
```json
{
  "run_date": "<ISO8601 now>",
  "run_date_local": "<YYYY-MM-DD>",
  "sprint_id": "<sprint_id>",
  "site": "BiztechCS",
  "sprint_day": <sprint_day>,
  "sprint_complete": false,
  "tasks_triggered": ["<title of each task triggered — never empty if any ran>"],
  "tasks_reassigned": ["<title of each task reassigned>"],
  "tasks_held": ["<title of each task held>"],
  "telegram_sent": true,
  "telegram_messages": ["<each Telegram message text sent>"]
}
```

**CRITICAL:** `tasks_triggered` must list every task that was processed in Step 3, even if only one. Never write `[]` if tasks were triggered.

Also update `sprint-tasks-[sprint_id].json` with all status changes made during this run.

---

## Overnight schedule

- Machine 1 BiztechCS: 9 PM Mon–Fri
- Machine 1 AppJetty: 12:30 AM Tue–Sat
- Machine 2 PrintXpand: 9 PM Mon–Fri
- Machine 2 CRMJetty: 12:30 AM Tue–Sat

## Output

- Updates `seo-automation/outputs/sprint-tasks-[sprint_id].json`
- `seo-automation/outputs/sprint-pm-log-[date].json`
