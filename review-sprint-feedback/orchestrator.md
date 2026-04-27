# Review Sprint Feedback Orchestrator — BiztechCS

## Purpose
Read the human's feedback on the sprint plan, decide whether to reform specific sections
or rebuild the entire plan from scratch, then execute that decision.

Triggered by approval-bridge.js after REVISE or REJECT feedback is received via Telegram.

## Mode
MOCK

## Model
claude-opus-4-6

---

## HOW THIS ORCHESTRATOR WORKS

Same spawn pattern as seo-strategist/orchestrator.md — each step uses `sessions_spawn`
with `runtime="subagent"` and `cleanup="delete"`.

The key difference: after Step 1 (evaluate), this orchestrator branches based on the
agent's decision. DO NOT skip the decision step. DO NOT assume what the decision will be.

---

## SOUL OVERRIDE — CRITICAL

DO NOT write any plan files directly. DO NOT shortcut. Always spawn subagents.

---

## OUTPUT DISCIPLINE — CRITICAL

After each step: Report ONLY `✅ Step N done → filename`. Do NOT print file contents.

---

## PRE-CHECK

Before spawning any subagent, verify:
- `seo-automation/outputs/seo-strategist/sprint-plan.json` exists and is non-empty
- `seo-automation/outputs/seo-strategist/sprint-feedback.json` exists and has a non-empty `feedback` field

If either check fails: STOP. Reply "❌ Cannot review feedback — sprint-plan.json or sprint-feedback.json missing."

---

## Run Sequence

### Step 1 — Evaluate Feedback

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step 1 — Evaluate Sprint Feedback"
task: "Read the file seo-automation/seo-strategist/subskills/evaluate-sprint-feedback.md and follow ALL instructions in it exactly. Do not ask questions. Reply ONLY with: ✅ sprint-feedback-decision.json written (decision: reform|full_rerun)"
```

Expected output file: `seo-automation/outputs/seo-strategist/sprint-feedback-decision.json`
Failure action: STOP. Send Telegram alert: "❌ BiztechCS Sprint Review FAILED at Step 1 (Evaluate Feedback)."

---

### Branch: Read the Decision

After Step 1 completes, read `seo-automation/outputs/seo-strategist/sprint-feedback-decision.json`.
Extract the `decision` field.

---

### If decision = "reform" — Fix specific sections and re-deliver

**Step 2 — Reform Sprint Plan**

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step 2 — Reform Sprint Plan"
task: "Read the file seo-automation/seo-strategist/subskills/reform-sprint-plan.md and follow ALL instructions in it exactly. Do not ask questions. Reply ONLY with: ✅ sprint-plan.json reformed"
```

Expected output: `seo-automation/outputs/seo-strategist/sprint-plan.json` modified
Failure action: STOP. Send Telegram alert: "❌ BiztechCS Sprint Review FAILED at Step 2 (Reform)."

---

**Step 3 — Regenerate Sprint PDF**

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step 3 — Regenerate Sprint PDF"
task: "Read the file seo-automation/seo-strategist/subskills/generate-sprint-pdf.md and follow ALL instructions in it exactly. Do not ask questions. Reply ONLY with: ✅ generate-sprint-pdf-status.json written"
```

Expected output file: `seo-automation/outputs/seo-strategist/generate-sprint-pdf-status.json`
Failure action: WARNING — continue with HTML fallback.

---

**Step 4 — Redeliver Sprint Plan**

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step 4 — Redeliver Sprint Plan"
task: "Read the file seo-automation/seo-strategist/subskills/deliver-sprint-plan.md and follow ALL instructions in it exactly. Do not ask questions. Reply ONLY with: ✅ sprint plan delivered + sprint-approval.json written"
```

Expected output file: `seo-automation/outputs/seo-strategist/sprint-approval.json` (status: "pending")
Failure action: STOP. Send Telegram alert: "❌ BiztechCS Sprint Review FAILED at Step 4 (Redeliver)."

---

### If decision = "full_rerun" — Discard plan and rebuild from scratch

**Step 2 — Cleanup All Sprint Outputs**

Run this bash command to delete all previous sprint plan data:

```bash
rm -f \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/intelligence-report/intelligence-brief-parsed.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/seo-strategist/attack-vectors.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/seo-strategist/content-plan.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/seo-strategist/technical-plan.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/seo-strategist/offpage-plan.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/seo-strategist/sprint-plan.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/seo-strategist/sprint-plan.md \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/seo-strategist/sprint-plan.html \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/seo-strategist/generate-sprint-pdf-status.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/seo-strategist/sprint-approval.json
```

Do NOT delete: `report-summary.json`, `report-approval.json`, `sprint-feedback.json`, `sprint-feedback-decision.json`
These are kept so the new run has context on why the plan was rejected.

**Step 3 — Send Telegram notification**

```bash
openclaw message send \
  --channel telegram \
  --target -1003829892114 \
  --message "🔄 Sprint plan discarded. Rebuilding from scratch based on your feedback.

Reason: <feedback_summary from sprint-feedback-decision.json>

A new sprint plan will arrive shortly."
```

**Step 4 — Trigger full seo-strategist re-run**

```bash
openclaw system event \
  --text "Sprint plan rejected and discarded. Start fresh seo-strategist run using <strategistOrchestratorPath>. Previous rejection reason stored in sprint-feedback.json — read it as additional context before generating the new plan." \
  --mode now
```

Where `<strategistOrchestratorPath>` = the absolute path to `seo-automation/seo-strategist/orchestrator.md`

---

## End Condition

**reform path:** `sprint-approval.json` has `status: "pending"`, new PDF sent to Telegram
**full_rerun path:** seo-strategist event fired, Telegram confirmation sent

Reply with one of:
- `✅ Sprint plan reformed and redelivered to Telegram.`
- `✅ Sprint plan discarded. Full re-run triggered.`
