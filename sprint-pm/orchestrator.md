# Sprint PM Orchestrator — BiztechCS

## Purpose
Daily scheduling + execution orchestrator. Calculates today's sprint day, updates task statuses, spawns execution agents (technical-seo, off-page-seo, content-pipeline) via sessions_spawn, writes the daily log, and sends a Telegram summary.

## Mode
MOCK

---

## HOW THIS ORCHESTRATOR WORKS

Each execution agent is spawned via `sessions_spawn` with `runtime="subagent"` and `agentId="sprint-pm"`.
The subagent reads the target orchestrator .md file and executes it in an isolated context.

**sessions_spawn is SYNCHRONOUS.** When sessions_spawn returns, the subagent has ALREADY completed. Do NOT wait, do NOT check for completion events. Proceed IMMEDIATELY to the next step after each sessions_spawn returns.

**DO NOT skip steps. DO NOT call openclaw CLI. Use sessions_spawn for all subagent calls.**

---

## SOUL OVERRIDE — CRITICAL

The "be minimal" rule does NOT apply here.

**You are NOT finished when subagents complete.** Spawning subagents is Steps 4–6. You still have Step 7 remaining after they return.

**Step 7 MUST execute.** You are not done until:
1. `sprint-pm-log-[today].json` is written to disk
2. Telegram notification is sent

Do not stop, do not return, do not summarise early. Execute every step in order. After Step 6 finishes, go directly to Step 7.

---

## OUTPUT DISCIPLINE

- Write all files using the write tool.
- After each step: `✅ Step N done`
- Final reply only after Step 7 completes: `✅ Sprint PM Day [N] complete — log written, Telegram sent`

---

## PRECONDITIONS

Before starting, verify:
- `seo-automation/outputs/sprint-pm/sprint-tasks-[sprint_id].json` exists
- `seo-automation/outputs/seo-strategist/sprint-approval.json` exists with `status: "approved"`

Read `seo-automation/outputs/seo-strategist/sprint-approval.json` to get `sprint_id` and `sprint_start`.

---

## Step 1 — Calculate sprint day

Calculate: `sprint_day = (today - sprint_start) in days + 1`

If `sprint_day > 10`:
- Send Telegram: "🏁 Sprint [sprint_id] complete — Day 10 passed. No tasks to dispatch."
- Stop.

✅ Step 1 done — proceed to Step 2.

---

## Step 2 — Find today's tasks

Read `seo-automation/outputs/sprint-pm/sprint-tasks-[sprint_id].json`.

Find tasks where `scheduledDay == "Day [sprint_day]"` AND `status == "Not Started"`.

**Duplicate run check:** Before processing, read any existing `seo-automation/outputs/sprint-pm/sprint-pm-log-[date].json` files. If a log already exists for today, all tasks from today are already dispatched — do NOT re-trigger them. Send Telegram: "ℹ️ Sprint PM Day [N] already ran today. Skipping." and stop.

Also find missed tasks: `scheduledDay` day number < sprint_day AND `status == "Not Started"` AND no prior sprint-pm-log covers that day → reschedule to `"Day [sprint_day+1]"`.

Record:
- `today_tasks` = tasks for Day [sprint_day] with status "Not Started"
- `missed_tasks` = tasks rescheduled
- `technical_tasks` = today_tasks where taskType == "Technical"
- `offpage_tasks` = today_tasks where taskType == "Off-Page"
- `content_tasks` = today_tasks where taskType == "Content"

✅ Step 2 done — proceed to Step 3.

---

## Step 3 — Update sprint-tasks JSON

Read the full `seo-automation/outputs/sprint-pm/sprint-tasks-[sprint_id].json`.

**For EVERY task in `today_tasks` (ALL types — Technical, Off-Page, AND Content):**
- Change ONLY the `status` field to exactly `"In Progress"`
- The status value MUST be exactly the string `"In Progress"` — not `"Pending Review"`, not `"Dispatched"`, not any other value
- Do NOT modify title, notes, slug, taskType, scheduledDay, or any other field

**For EVERY task in `missed_tasks`:**
- Change ONLY the `scheduledDay` field to `"Day [sprint_day+1]"`

CRITICAL: Write valid JSON only. Do not add any control characters (ASCII < 0x20 except `\t`, `\n`, `\r`), unescaped quotes, or raw newlines inside string values. Write the complete updated file back using the write tool.

If missed tasks exist, send Telegram:
```
openclaw message send --channel telegram --target -1003829892114 --message "⚠️ Sprint PM: [N] missed tasks from prior days reassigned to Day [sprint_day+1] — Sprint: [sprint_id]"
```

✅ Step 3 done — proceed to Step 4.

---

## Step 4 — Spawn Technical SEO (if any Technical tasks today)

If `technical_tasks` is non-empty:

Spawn sub-agent:
```
runtime: "subagent"
agentId: "sprint-pm"
lightContext: true
cleanup: "delete"
label: "Step 4 — Technical SEO"
task: "Read the file seo-automation/technical-seo/orchestrator.md and follow ALL instructions exactly. Sprint ID: [sprint_id]. Technical tasks for today: [list each Sr + title + notes]. Write all output files using the write tool. Reply ONLY with: ✅ technical-brief-[slug].md written for [N] tasks"
```

Expected output: `seo-automation/outputs/sprint-pm/technical-brief-[slug].md` (one per task)
Failure action: WARNING — note failure in log, continue to Step 5.

If `technical_tasks` is empty: skip this step.

✅ Step 4 done — proceed to Step 5.

---

## Step 5 — Spawn Off-Page SEO (if any Off-Page tasks today)

If `offpage_tasks` is non-empty:

Spawn sub-agent:
```
runtime: "subagent"
agentId: "sprint-pm"
lightContext: true
cleanup: "delete"
label: "Step 5 — Off-Page SEO"
task: "Read the file seo-automation/off-page-seo/orchestrator.md and follow ALL instructions exactly. Sprint ID: [sprint_id]. Off-page tasks for today: [list each Sr + title + notes]. Write all output files using the write tool. Reply ONLY with: ✅ outreach-package-[sprint_id].json written"
```

Expected output: `seo-automation/outputs/social-media/outreach-package-[sprint_id].json`
Failure action: WARNING — note failure in log, continue.

After off-page sub-agent completes, spawn outreach-manager:

```
runtime: "subagent"
agentId: "sprint-pm"
lightContext: true
cleanup: "delete"
label: "Step 5b — Outreach Manager"
task: "Read the file seo-automation/outreach-manager/orchestrator.md and follow ALL instructions exactly. Sprint ID: [sprint_id]. Read seo-automation/outputs/social-media/outreach-package-[sprint_id].json. Write all output files using the write tool. Reply ONLY with: ✅ outreach-log-[sprint_id].json written"
```

Expected output: `seo-automation/outputs/social-media/outreach-log-[sprint_id].json`
Failure action: WARNING — note failure in log, continue.

If `offpage_tasks` is empty: skip this step.

✅ Step 5 done — proceed to Step 6.

---

## Step 6 — Spawn Content Pipeline (one per Content task today)

If `content_tasks` is non-empty:

For EACH task in `content_tasks`, spawn ONE sub-agent:

```
runtime: "subagent"
agentId: "sprint-pm"
lightContext: true
cleanup: "delete"
label: "Step 6 — Content Sr[sr]"
task: "Read the file seo-automation/content-pipeline/orchestrator.md and follow ALL instructions exactly. Sprint ID: [sprint_id]. Task Sr[sr]: [title]. Primary keyword: [primary_keyword]. Author: [author]. Target word count: [target_word_count]. Write all output files using the write tool. Reply ONLY with: ✅ content-brief-[slug].json written"
```

Expected output: `seo-automation/outputs/content-pipeline/content-brief-[slug].json`
Failure action: WARNING — note failure in log, continue to next content task.

If `content_tasks` is empty: skip this step.

✅ Step 6 done.

---

## ⚠️ MANDATORY CONTINUATION — DO NOT STOP HERE

After Step 6 completes (or is skipped), you MUST proceed to Step 7 immediately.
You are NOT finished. Step 7 has not run yet. Execute it now.

---

## Step 7 — Write log and send Telegram

This step is MANDATORY. Execute it regardless of whether subagents succeeded or failed.

### 7a — Write sprint-pm log

Write `seo-automation/outputs/sprint-pm/sprint-pm-log-[today].json`:

```json
{
  "run_date": "<ISO8601 timestamp>",
  "run_date_local": "<YYYY-MM-DD>",
  "sprint_id": "<sprint_id>",
  "site": "BiztechCS",
  "sprint_day": <N>,
  "sprint_complete": false,
  "tasks_triggered": ["<exact title of every task set to In Progress in Step 3>"],
  "tasks_reassigned": ["<exact title of every rescheduled task, or empty array>"],
  "technical_count": <number of technical tasks dispatched>,
  "offpage_count": <number of off-page tasks dispatched>,
  "content_count": <number of content tasks dispatched>,
  "agents_dispatched": ["technical-seo", "off-page-seo", "outreach-manager"]
}
```

Use the write tool to write this file. Confirm it is written before proceeding to 7b.

### 7b — Send Telegram notification

Send this Telegram message. Replace all placeholders with actual values:

```
openclaw message send --channel telegram --target -1003829892114 --message "✅ Sprint PM Day [sprint_day] complete — Sprint: [sprint_id]

Technical SEO: [✅ [N] brief(s) written (MOCK) | ⚠️ no technical tasks today]
Off-Page SEO: [✅ outreach-package written — [N] tasks queued (MOCK) | ⚠️ no off-page tasks today]
Outreach Manager: [✅ outreach-log written (MOCK) | ⚠️ skipped]
Content Pipeline: [✅ [N] brief(s) queued (MOCK) | ⚠️ no content tasks today]

Next — Day [sprint_day+1]: [list first 3 tasks scheduled for that day, or 'Sprint complete']"
```

✅ Step 7 done.

---

## Final reply

After Step 7 completes, reply with exactly:
`✅ Sprint PM Day [N] complete — log written, Telegram sent`

---

## Output files

- `seo-automation/outputs/sprint-pm/sprint-tasks-[sprint_id].json` — updated statuses (Step 3)
- `seo-automation/outputs/sprint-pm/sprint-pm-log-[today].json` — daily run log (Step 7a)
- `seo-automation/outputs/sprint-pm/technical-brief-[slug].md` — written by technical-seo subagent (Step 4)
- `seo-automation/outputs/social-media/outreach-package-[sprint_id].json` — written by off-page-seo subagent (Step 5)
- `seo-automation/outputs/social-media/outreach-log-[sprint_id].json` — written by outreach-manager subagent (Step 5b)
- `seo-automation/outputs/content-pipeline/content-brief-[slug].json` — written by content-pipeline subagent (Step 6)
