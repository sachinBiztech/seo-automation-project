# Reform Sprint Plan Orchestrator — BiztechCS

## Purpose
Apply human revision notes to the sprint plan, regenerate the PDF, and redeliver to Telegram.
Triggered by approval-bridge.js when revision notes are received (after REVISE button press).

## Mode
MOCK

## Model
claude-opus-4-6

---

## HOW THIS ORCHESTRATOR WORKS

Identical spawn pattern to seo-strategist/orchestrator.md — each step uses `sessions_spawn`
with `runtime="subagent"` and `cleanup="delete"`.

---

## SOUL OVERRIDE — CRITICAL

Same rules as seo-strategist/orchestrator.md — DO NOT write files directly, always spawn.
DO NOT shortcut by summarizing or editing the sprint plan in this context.

---

## OUTPUT DISCIPLINE — CRITICAL

After each step: Report ONLY `✅ Step R-N done → filename`. Do NOT print file contents.

---

## PRE-CHECK

Before running any step, verify:
- `seo-automation/outputs/sprint-plan.json` exists and is non-empty
- `seo-automation/outputs/sprint-approval.json` exists with a `revision_history` array containing
  at least one entry with non-null `notes`

If either check fails: STOP. Reply "❌ Cannot run reform — no sprint plan or revision notes found."

---

## CLEANUP BEFORE RUNNING

Before spawning subagents, delete stale files:

```bash
rm -f \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/generate-sprint-pdf-status.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/sprint-plan.md \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/sprint-plan.html
```

Do NOT delete `sprint-plan.json` (reform input) or `sprint-approval.json` (has revision history).

---

## SPAWN PATTERN

```
sessions_spawn({
  runtime: "subagent",
  agentId: "seo-strategist",
  lightContext: true,
  cleanup: "delete",
  label: "Step R-N — <name>",
  task: "<self-contained instruction>"
})
```

Spawn ONE step at a time. Wait for completion before spawning the next.

---

## Run Sequence

### Step R1 — Reform Sprint Plan

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step R1 — Reform Sprint Plan"
task: "Read the file seo-automation/seo-strategist/subskills/reform-sprint-plan.md and follow ALL instructions in it exactly. Do not ask questions. Reply ONLY with: ✅ sprint-plan.json reformed (iteration N)"
```

Expected output: `seo-automation/outputs/sprint-plan.json` modified (mtime newer than before step)
Failure action: STOP. Send Telegram alert: "❌ BiztechCS Sprint Reform FAILED at Step R1 (Reform)."

---

### Step R2 — Regenerate Sprint PDF

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step R2 — Regenerate Sprint PDF"
task: "Read the file seo-automation/seo-strategist/subskills/generate-sprint-pdf.md and follow ALL instructions in it exactly. Do not ask questions. Reply ONLY with: ✅ generate-sprint-pdf-status.json written"
```

Expected output file: `seo-automation/outputs/generate-sprint-pdf-status.json`
Failure action: WARNING — continue with HTML fallback. Do NOT stop.

---

### Step R3 — Redeliver Sprint Plan

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step R3 — Redeliver Sprint Plan"
task: "Read the file seo-automation/seo-strategist/subskills/deliver-sprint-plan.md and follow ALL instructions in it exactly. Do not ask questions. Reply ONLY with: ✅ sprint plan delivered + sprint-approval.json written"
```

Expected output file: `seo-automation/outputs/sprint-approval.json` (status: "pending")
Failure action: STOP. Send Telegram alert: "❌ BiztechCS sprint plan re-delivery FAILED at Step R3."

---

## End Condition

Pipeline is complete when:
- `sprint-plan.json` has been reformed (Step R1)
- New PDF (or HTML fallback) sent to Telegram (Step R3)
- `sprint-approval.json` has `status: "pending"` (Step R3)

Reply: "✅ BiztechCS reformed Sprint Plan sent to Telegram. Awaiting human approval."
