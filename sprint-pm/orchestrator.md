# Sprint PM Orchestrator — BiztechCS

## Purpose
Daily scheduling + execution orchestrator. Calculates today's sprint day, updates task statuses, then spawns execution agents (technical-seo, off-page-seo, content-pipeline) as subagents via sessions_spawn.

## Mode
MOCK

---

## HOW THIS ORCHESTRATOR WORKS

Each execution agent is spawned via `sessions_spawn` with `runtime="subagent"` and `agentId="sprint-pm"`.
The subagent reads the target orchestrator .md file and executes it in an isolated context.
This is the same pattern as post-approval.

**DO NOT skip steps. DO NOT call openclaw CLI. Use sessions_spawn for all agent calls.**

---

## SOUL OVERRIDE — CRITICAL

The "be minimal" rule does NOT apply here. All steps must complete.

---

## OUTPUT DISCIPLINE

- Write all files using the write tool.
- After each step: `✅ Step N done`
- Final reply: `✅ Sprint PM complete — Day [N], [N] agents dispatched`

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
- Send Telegram: "🏁 Sprint [sprint_id] complete — Day 10 passed."
- Stop.

---

## Step 2 — Find today's tasks

Read `seo-automation/outputs/sprint-pm/sprint-tasks-[sprint_id].json`.

Find tasks where `scheduledDay == "Day [sprint_day]"` AND `status == "Not Started"`.

**Before processing missed tasks:** Check which days have already run by reading any existing `seo-automation/outputs/sprint-pm/sprint-pm-log-[date].json` files. If a previous log exists for Day N, treat ALL tasks from that day as already dispatched — do NOT re-trigger them even if their status shows "Not Started" (status may have been reset by regeneration).

Also find missed tasks: `scheduledDay` day number < sprint_day AND `status == "Not Started"` AND no prior sprint-pm-log covers that day → reschedule to `"Day [sprint_day+1]"`. Do NOT re-run tasks that were already dispatched in a prior log.

---

## Step 3 — Update sprint-tasks JSON

Read the full `seo-automation/outputs/sprint-pm/sprint-tasks-[sprint_id].json`.
For every task found in Step 2, change ONLY the `status` field to `"In Progress"`.
For rescheduled tasks, change ONLY the `scheduledDay` field.
Do NOT modify any other field (title, notes, slug, etc.) — copy them exactly as-is.

CRITICAL: Write valid JSON only. Do not add any control characters, unescaped quotes, or newlines inside string values. Write the complete updated file back using the write tool.

If rescheduled tasks exist, send Telegram:
```
openclaw message send --channel telegram --target -1003829892114 --message "⚠️ [N] missed tasks reassigned to Day [sprint_day+1]"
```

---

## Step 4 — Spawn Technical SEO (if any Technical tasks today)

If today's tasks include Technical type tasks:

Spawn sub-agent:
```
runtime: "subagent"
agentId: "sprint-pm"
lightContext: true
cleanup: "delete"
label: "Step 4 — Technical SEO"
task: "Read the file seo-automation/technical-seo/orchestrator.md and follow ALL instructions exactly. Sprint ID: [sprint_id]. Technical tasks for today: [list each Sr + title]. Write all output files using the write tool. Reply ONLY with: ✅ technical-changes-[date].md written"
```

Expected output: `seo-automation/outputs/sprint-pm/technical-changes-[today].md`
Failure action: WARNING — log failure, continue to off-page step.

---

## Step 5 — Spawn Off-Page SEO (if any Off-Page tasks today)

If today's tasks include Off-Page type tasks:

Spawn sub-agent:
```
runtime: "subagent"
agentId: "sprint-pm"
lightContext: true
cleanup: "delete"
label: "Step 5 — Off-Page SEO"
task: "Read the file seo-automation/off-page-seo/orchestrator.md and follow ALL instructions exactly. Sprint ID: [sprint_id]. Off-page tasks for today: [list each Sr + title]. Write all output files using the write tool. Reply ONLY with: ✅ outreach-package-[sprint_id].json written"
```

Expected output: `seo-automation/outputs/social-media/outreach-package-[sprint_id].json`
Failure action: WARNING — log failure, continue.

After off-page completes, spawn outreach-manager:

```
runtime: "subagent"
agentId: "sprint-pm"
lightContext: true
cleanup: "delete"
label: "Step 5b — Outreach Manager"
task: "Read the file seo-automation/outreach-manager/orchestrator.md and follow ALL instructions exactly. Sprint ID: [sprint_id]. Read seo-automation/outputs/social-media/outreach-package-[sprint_id].json. Write all output files using the write tool. Reply ONLY with: ✅ outreach-log-[sprint_id].json written"
```

Expected output: `seo-automation/outputs/social-media/outreach-log-[sprint_id].json`
Failure action: WARNING — log failure, continue.

---

## Step 6 — Spawn Content Pipeline (one per Content task today)

For EACH Content task in today's list, spawn ONE subagent:

```
runtime: "subagent"
agentId: "sprint-pm"
lightContext: true
cleanup: "delete"
label: "Step 6 — Content Sr[sr]"
task: "Read the file seo-automation/content-pipeline/orchestrator.md and follow ALL instructions exactly. Sprint ID: [sprint_id]. Task Sr[sr]: [title]. Primary keyword: [primary_keyword]. Author: [author]. Target word count: [target_word_count]. Write all output files using the write tool. Reply ONLY with: ✅ content-brief-[slug].json written"
```

Expected output: `seo-automation/outputs/content-pipeline/content-brief-[slug].json`
Failure action: WARNING — log and continue to next content task.

---

## Step 7 — Write sprint-pm log

Write `seo-automation/outputs/sprint-pm/sprint-pm-log-[today].json`:
```json
{
  "run_date": "<ISO8601>",
  "run_date_local": "<YYYY-MM-DD>",
  "sprint_id": "<sprint_id>",
  "site": "BiztechCS",
  "sprint_day": <N>,
  "sprint_complete": false,
  "tasks_triggered": ["<title of every task set to In Progress>"],
  "tasks_reassigned": ["<titles of rescheduled tasks>"],
  "agents_dispatched": ["technical-seo", "off-page-seo", "outreach-manager"]
}
```

Send Telegram using this exact command:
```
openclaw message send --channel telegram --target -1003829892114 --message "✅ Sprint PM Day [N] complete — Sprint: [sprint_id]

Technical SEO: ✅ technical-changes-[date].md written
Off-Page SEO: ✅ outreach-package written — 8 emails queued (MOCK)
Outreach: ✅ outreach-log written

Next: Day 2 content pipeline starts tomorrow."
```

---

## Output files

- `seo-automation/outputs/sprint-pm/sprint-tasks-[sprint_id].json` — updated statuses
- `seo-automation/outputs/sprint-pm/sprint-pm-log-[today].json`
- `seo-automation/outputs/sprint-pm/technical-changes-[today].md` — written by technical-seo subagent
- `seo-automation/outputs/social-media/outreach-package-[sprint_id].json` — written by off-page-seo subagent
- `seo-automation/outputs/social-media/outreach-log-[sprint_id].json` — written by outreach-manager subagent
