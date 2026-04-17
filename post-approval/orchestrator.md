# Post-Approval Pipeline — BiztechCS

## Purpose
Triggered automatically when the human approves the sprint plan on Telegram.
Runs Product Owner review, Business Layer checks, and project cost estimation.
Sends the validated plan with cost breakdown back to Telegram for final "Proceed" confirmation before task sheet is populated.

## Mode
MOCK

## Model
claude-opus-4-6

## Trigger
Called by `approval-bridge.js` when `approve|biztechcs_sprint_*` callback is received.

---

## HOW THIS ORCHESTRATOR WORKS

Each step spawns an isolated sub-agent via `sessions_spawn` with `runtime="subagent"`.
The sub-agent runs the subskill in its own clean context window, writes output to disk, and returns one line.
The orchestrator never reads JSON content — only checks that output files exist.

**This prevents context overflow regardless of pipeline length.**

---

## SOUL OVERRIDE — CRITICAL

The SOUL.md instruction "be minimal" does NOT apply here. This is an automated pipeline orchestrator, not a conversational agent.

**DO NOT write any output files directly in this orchestrator context.**
**DO NOT skip steps.**

You MUST use `sessions_spawn` for EVERY step listed in Run Sequence below.

The ONLY thing this orchestrator does is:
1. Check preconditions
2. Call `sessions_spawn` for each step in order
3. Check file existence after each step
4. Send Telegram alerts on failures
5. Report pipeline completion at the end

---

## OUTPUT DISCIPLINE — CRITICAL

After each step completes:
- Report ONLY: `✅ Step N done → filename.json`
- Do NOT read, echo, print, or summarize any JSON file contents
- Do NOT repeat the task you gave the sub-agent
- Move immediately to the next step

---

## SPAWN PATTERN

For every step, use `sessions_spawn` like this:

```
sessions_spawn({
  runtime: "subagent",
  agentId: "post-approval",
  lightContext: true,
  cleanup: "delete",
  label: "Step N — <name>",
  task: "<self-contained instruction for the subskill>"
})
```

Wait for each spawn to complete before starting the next step.
Check the result: if the sub-agent replies with ❌, treat as failure per the step's failure action.

**CRITICAL: Do NOT generate any conversational text mid-pipeline. Run ALL steps to completion, THEN reply once.**

---

## PRE-CHECK

Before running any step, verify:
- `seo-automation/outputs/sprint-plan.json` exists and is non-empty
- `seo-automation/outputs/sprint-approval.json` has `status: "approved"`

If either check fails: STOP. Reply "❌ Cannot run post-approval — sprint not approved."

---

## Run Sequence

### Step 1 — Product Owner: Scan Website

Spawn sub-agent:
```
runtime: "subagent"
agentId: "post-approval"
lightContext: true
cleanup: "delete"
label: "Step 1 — PO: Scan Website"
task: "Read the file seo-automation/product-owner/subskills/scan-website.md and follow ALL instructions in it exactly. Read seo-automation/product-owner/biztechcs-product-owner-config.md as input. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ website-scan.json written"
```

Expected output file: `seo-automation/outputs/website-scan.json`
Failure action: WARNING — proceed with config-only data. Do NOT stop.

---

### Step 2 — Product Owner: Validate Business Alignment

Spawn sub-agent:
```
runtime: "subagent"
agentId: "post-approval"
lightContext: true
cleanup: "delete"
label: "Step 2 — PO: Business Alignment"
task: "Read the file seo-automation/product-owner/subskills/validate-business-alignment.md and follow ALL instructions in it exactly. Read seo-automation/outputs/sprint-plan.json, seo-automation/outputs/website-scan.json, seo-automation/product-owner/biztechcs-product-owner-config.md. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ alignment-check.json written"
```

Expected output file: `seo-automation/outputs/alignment-check.json`
Failure action: STOP. Send Telegram alert: "❌ Post-Approval: Product Owner alignment check failed."

---

### Step 3 — Product Owner: Check Competitor Claims

Spawn sub-agent:
```
runtime: "subagent"
agentId: "post-approval"
lightContext: true
cleanup: "delete"
label: "Step 3 — PO: Competitor Claims"
task: "Read the file seo-automation/product-owner/subskills/check-competitor-claims.md and follow ALL instructions in it exactly. Read seo-automation/outputs/sprint-plan.json and seo-automation/outputs/competitor-findings.json. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ competitor-claims-check.json written"
```

Expected output file: `seo-automation/outputs/competitor-claims-check.json`
Failure action: WARNING — note unverified claims and continue.

---

### Step 4 — Product Owner: Enrich With Product Context

Spawn sub-agent:
```
runtime: "subagent"
agentId: "post-approval"
lightContext: true
cleanup: "delete"
label: "Step 4 — PO: Enrich Plan"
task: "Read the file seo-automation/product-owner/subskills/enrich-with-product-context.md and follow ALL instructions in it exactly. Read seo-automation/outputs/sprint-plan.json, seo-automation/outputs/website-scan.json, seo-automation/product-owner/biztechcs-product-owner-config.md. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ enriched-sprint-plan.json written"
```

Expected output file: `seo-automation/outputs/enriched-sprint-plan.json`
Failure action: STOP. Send Telegram alert: "❌ Post-Approval: Product Owner enrichment failed."

---

### Step 5 — Product Owner: Apply Guardrails

Spawn sub-agent:
```
runtime: "subagent"
agentId: "post-approval"
lightContext: true
cleanup: "delete"
label: "Step 5 — PO: Apply Guardrails"
task: "Read the file seo-automation/product-owner/subskills/apply-guardrails.md and follow ALL instructions in it exactly. Read seo-automation/outputs/enriched-sprint-plan.json and seo-automation/product-owner/biztechcs-product-owner-config.md. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ guardrails-check.json written"
```

Expected output file: `seo-automation/outputs/guardrails-check.json`
Failure action: STOP. Send Telegram alert: "❌ Post-Approval: Guardrails check failed."

---

### Step 6 — Product Owner: Produce Review Output

Spawn sub-agent:
```
runtime: "subagent"
agentId: "post-approval"
lightContext: true
cleanup: "delete"
label: "Step 6 — PO: Review Output"
task: "Read the file seo-automation/product-owner/subskills/produce-review-output.md and follow ALL instructions in it exactly. Read seo-automation/outputs/alignment-check.json, seo-automation/outputs/competitor-claims-check.json, seo-automation/outputs/guardrails-check.json, seo-automation/outputs/enriched-sprint-plan.json. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ product-owner-review.json written — verdict: [approved|revision_required]"
```

Expected output file: `seo-automation/outputs/product-owner-review.json`
Failure action: STOP. Send Telegram alert: "❌ Post-Approval: Product Owner review failed to complete."

**After Step 6:** Read `product-owner-review.json.verdict`.
- If `revision_required`: Send Telegram: "🔄 Product Owner flagged revisions for [sprint_id]. Check product-owner-review.json for details. Review and re-submit." STOP pipeline.
- If `escalate_to_human`: Send Telegram: "⚠️ Product Owner: revision loop failed for [sprint_id]. Human review required." STOP pipeline.
- If `approved`: continue to Step 7.

---

### Step 7 — Business Layer: Check Quota Compliance

Spawn sub-agent:
```
runtime: "subagent"
agentId: "post-approval"
lightContext: true
cleanup: "delete"
label: "Step 7 — BL: Quota Check"
task: "Read the file seo-automation/business-layer/subskills/check-quota-compliance.md and follow ALL instructions in it exactly. Read seo-automation/outputs/enriched-sprint-plan.json and seo-automation/business-layer/biztechcs-business-config.md. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ quota-check.json written — verdict: [compliant|over_limit]"
```

Expected output file: `seo-automation/outputs/quota-check.json`
Failure action: STOP. Send Telegram alert: "❌ Post-Approval: Quota compliance check failed."

**After Step 7:** Check `quota-check.json.verdict`.
- If `over_limit`: Send Telegram: "❌ Sprint plan exceeds content quotas. Review quota-check.json and trim plan." STOP pipeline.
- If `compliant`: continue.

---

### Step 8 — Business Layer: Check Goal Alignment

Spawn sub-agent:
```
runtime: "subagent"
agentId: "post-approval"
lightContext: true
cleanup: "delete"
label: "Step 8 — BL: Goal Alignment"
task: "Read the file seo-automation/business-layer/subskills/check-goal-alignment.md and follow ALL instructions in it exactly. Read seo-automation/outputs/enriched-sprint-plan.json, seo-automation/business-layer/biztechcs-business-config.md, seo-automation/outputs/report-summary.json. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ goal-alignment.json written"
```

Expected output file: `seo-automation/outputs/goal-alignment.json`
Failure action: WARNING — note and continue.

---

### Step 9 — Business Layer: Check MQL/SQL Performance

Spawn sub-agent:
```
runtime: "subagent"
agentId: "post-approval"
lightContext: true
cleanup: "delete"
label: "Step 9 — BL: MQL/SQL Check"
task: "Read the file seo-automation/business-layer/subskills/check-mql-sql-performance.md and follow ALL instructions in it exactly. Read seo-automation/outputs/report-summary.json, seo-automation/outputs/goal-alignment.json, seo-automation/business-layer/biztechcs-business-config.md. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ mql-check.json written"
```

Expected output file: `seo-automation/outputs/mql-check.json`
Failure action: WARNING — continue without MQL context if missing.

---

### Step 10 — Business Layer: Check Topic Territory

Spawn sub-agent:
```
runtime: "subagent"
agentId: "post-approval"
lightContext: true
cleanup: "delete"
label: "Step 10 — BL: Topic Territory"
task: "Read the file seo-automation/business-layer/subskills/check-topic-territory.md and follow ALL instructions in it exactly. Read seo-automation/outputs/enriched-sprint-plan.json and seo-automation/business-layer/biztechcs-business-config.md. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ topic-territory-check.json written — verdict: [compliant|violations_found]"
```

Expected output file: `seo-automation/outputs/topic-territory-check.json`
Failure action: STOP. Send Telegram alert: "❌ Topic territory violations found. Review topic-territory-check.json."

---

### Step 11 — Business Layer: Build Tiered Options

Spawn sub-agent:
```
runtime: "subagent"
agentId: "post-approval"
lightContext: true
cleanup: "delete"
label: "Step 11 — BL: Tiered Options"
task: "Read the file seo-automation/business-layer/subskills/build-tiered-options.md and follow ALL instructions in it exactly. Read seo-automation/outputs/enriched-sprint-plan.json, seo-automation/outputs/quota-check.json, seo-automation/outputs/topic-territory-check.json, seo-automation/outputs/guardrails-check.json, seo-automation/business-layer/biztechcs-business-config.md. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ tiered-sprint-options.json written"
```

Expected output file: `seo-automation/outputs/tiered-sprint-options.json`
Failure action: STOP. Send Telegram alert: "❌ Post-Approval: Business Layer failed to build tiered options."

---

### Step 12 — Calculate Project Cost

Spawn sub-agent:
```
runtime: "subagent"
agentId: "post-approval"
lightContext: true
cleanup: "delete"
label: "Step 12 — Calculate Project Cost"
task: "Read the file seo-automation/post-approval/subskills/calculate-project-cost.md and follow ALL instructions in it exactly. Read seo-automation/outputs/tiered-sprint-options.json and seo-automation/business-layer/biztechcs-business-config.md. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ project-cost.json written — total: ₹[amount]"
```

Expected output file: `seo-automation/outputs/project-cost.json`
Failure action: WARNING — continue without cost breakdown if missing.

---

### Step 13 — Deliver Validated Plan + Cost to Telegram

Spawn sub-agent:
```
runtime: "subagent"
agentId: "post-approval"
lightContext: true
cleanup: "delete"
label: "Step 13 — Deliver Validated Plan"
task: "Read the file seo-automation/post-approval/subskills/deliver-validated-plan.md and follow ALL instructions in it exactly. Do not ask questions. Reply ONLY with: ✅ post-approval delivered + post-approval-status.json written"
```

Expected output file: `seo-automation/outputs/post-approval-status.json`
Failure action: STOP. Send Telegram alert: "❌ Post-Approval: Delivery to Telegram failed."

---

## End Condition

Pipeline is complete when:
- `product-owner-review.json` exists with `verdict: "approved"`
- `tiered-sprint-options.json` exists and is non-empty
- `project-cost.json` exists with total cost
- `post-approval-status.json` exists with `status: "pending_proceed"`
- Cost breakdown + tiered plan sent to Telegram with "Proceed" button

Reply: "✅ BiztechCS post-approval pipeline complete. Validated plan and cost sent to Telegram. Awaiting proceed confirmation."
