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

Each step is executed INLINE — you read the subskill file and follow its instructions directly in this session.
Do NOT use sessions_spawn. Do NOT spawn subagents. Do NOT poll anything.

After each step:
- Write the output file using the write tool
- Output ONE LINE only: `✅ Step N done → filename.json`
- Do NOT print or summarize file contents
- Move immediately to the next step

---

## AGENT RULES — MANDATORY

- Run every step from Step 1 to Step 13 without stopping
- NEVER say "taking too long" — time does not matter
- NEVER ask "would you like me to continue"
- NEVER stop mid-pipeline unless a step says "Failure action: STOP"
- After writing each output file, confirm with one line and immediately start the next step

---

## PRE-CHECK

Before running any step, verify:
- `seo-automation/outputs/seo-strategist/sprint-plan.json` exists and is non-empty
- `seo-automation/outputs/seo-strategist/sprint-approval.json` has `status: "approved"`

If either check fails: STOP. Reply "❌ Cannot run post-approval — sprint not approved."

---

## Run Sequence

### Step 1 — Product Owner: Scan Website
Read `seo-automation/product-owner/subskills/scan-website.md` and follow ALL instructions.
Also read `seo-automation/product-owner/biztechcs-product-owner-config.md` as input.
Expected output: `seo-automation/outputs/post-approval/website-scan.json`
Failure action: WARNING — proceed with config-only data. Do NOT stop.

---

### Step 2 — Product Owner: Validate Business Alignment
Read `seo-automation/product-owner/subskills/validate-business-alignment.md` and follow ALL instructions.
Read: sprint-plan.json, website-scan.json, biztechcs-product-owner-config.md.
Expected output: `seo-automation/outputs/post-approval/alignment-check.json`
Failure action: STOP. Send Telegram: "❌ Post-Approval: Product Owner alignment check failed."

---

### Step 3 — Product Owner: Check Competitor Claims
Read `seo-automation/product-owner/subskills/check-competitor-claims.md` and follow ALL instructions.
Read: sprint-plan.json, competitor-findings.json.
Expected output: `seo-automation/outputs/post-approval/competitor-claims-check.json`
Failure action: WARNING — note unverified claims and continue.

---

### Step 4 — Product Owner: Enrich With Product Context
Read `seo-automation/product-owner/subskills/enrich-with-product-context.md` and follow ALL instructions.
Read: sprint-plan.json, website-scan.json, biztechcs-product-owner-config.md.
Expected output: `seo-automation/outputs/post-approval/enriched-sprint-plan.json`
Failure action: STOP. Send Telegram: "❌ Post-Approval: Product Owner enrichment failed."

---

### Step 5 — Product Owner: Apply Guardrails
Read `seo-automation/product-owner/subskills/apply-guardrails.md` and follow ALL instructions.
Read: enriched-sprint-plan.json, biztechcs-product-owner-config.md.
Expected output: `seo-automation/outputs/post-approval/guardrails-check.json`
Failure action: STOP. Send Telegram: "❌ Post-Approval: Guardrails check failed."

---

### Step 6 — Product Owner: Produce Review Output
Read `seo-automation/product-owner/subskills/produce-review-output.md` and follow ALL instructions.
Read: alignment-check.json, competitor-claims-check.json, guardrails-check.json, enriched-sprint-plan.json.
Expected output: `seo-automation/outputs/post-approval/product-owner-review.json`
Failure action: STOP. Send Telegram: "❌ Post-Approval: Product Owner review failed to complete."

After writing product-owner-review.json, read its `verdict` field:
- If `revision_required`: Send Telegram: "🔄 Product Owner flagged revisions. Check product-owner-review.json." STOP.
- If `escalate_to_human`: Send Telegram: "⚠️ Product Owner: human review required." STOP.
- If `approved`: continue to Step 7.

---

### Step 7 — Business Layer: Check Quota Compliance
Read `seo-automation/business-layer/subskills/check-quota-compliance.md` and follow ALL instructions.
Read: enriched-sprint-plan.json, biztechcs-business-config.md.
Expected output: `seo-automation/outputs/post-approval/quota-check.json`
Failure action: STOP. Send Telegram: "❌ Post-Approval: Quota compliance check failed."

After writing quota-check.json, check `verdict`:
- If `over_limit`: Send Telegram: "❌ Sprint plan exceeds content quotas. Review quota-check.json." STOP.
- If `compliant`: continue.

---

### Step 8 — Business Layer: Check Goal Alignment
Read `seo-automation/business-layer/subskills/check-goal-alignment.md` and follow ALL instructions.
Read: enriched-sprint-plan.json, biztechcs-business-config.md, report-summary.json.
Expected output: `seo-automation/outputs/post-approval/goal-alignment.json`
Failure action: WARNING — note and continue.

---

### Step 9 — Business Layer: Check MQL/SQL Performance
Read `seo-automation/business-layer/subskills/check-mql-sql-performance.md` and follow ALL instructions.
Read: report-summary.json, goal-alignment.json, biztechcs-business-config.md.
Expected output: `seo-automation/outputs/post-approval/mql-check.json`
Failure action: WARNING — continue without MQL context if missing.

---

### Step 10 — Business Layer: Check Topic Territory
Read `seo-automation/business-layer/subskills/check-topic-territory.md` and follow ALL instructions.
Read: enriched-sprint-plan.json, biztechcs-business-config.md.
Expected output: `seo-automation/outputs/post-approval/topic-territory-check.json`
Failure action: STOP. Send Telegram: "❌ Topic territory violations found. Review topic-territory-check.json."

---

### Step 11 — Business Layer: Build Tiered Options
Read `seo-automation/business-layer/subskills/build-tiered-options.md` and follow ALL instructions.
Read: enriched-sprint-plan.json, quota-check.json, topic-territory-check.json, guardrails-check.json, biztechcs-business-config.md.
Expected output: `seo-automation/outputs/post-approval/tiered-sprint-options.json`
Failure action: STOP. Send Telegram: "❌ Post-Approval: Business Layer failed to build tiered options."

---

### Step 12 — Calculate Project Cost
Read `seo-automation/post-approval/subskills/calculate-project-cost.md` and follow ALL instructions.
Read: tiered-sprint-options.json, biztechcs-business-config.md.
Expected output: `seo-automation/outputs/post-approval/project-cost.json`
Failure action: WARNING — continue without cost breakdown if missing.

---

### Step 13 — Deliver Validated Plan + Cost to Telegram
Read `seo-automation/post-approval/subskills/deliver-validated-plan.md` and follow ALL instructions.

**⚠️ MANDATORY EXECUTION RULE:** Every `openclaw message send` command in deliver-validated-plan.md MUST be executed as a real bash command. Do NOT simulate or skip any send. Do NOT mark this step done unless the command returns "Sent via telegram".

Expected output: `seo-automation/outputs/post-approval/post-approval-status.json`
Failure action: STOP. Send Telegram: "❌ Post-Approval: Delivery to Telegram failed."

---

## End Condition

Pipeline is complete when:
- `product-owner-review.json` exists with `verdict: "approved"`
- `tiered-sprint-options.json` exists and is non-empty
- `project-cost.json` exists with total cost
- `post-approval-status.json` exists with `status: "pending_proceed"`
- Cost breakdown + tiered plan sent to Telegram with [✅ Proceed] [🔄 Adjust] buttons

Reply: "✅ BiztechCS post-approval pipeline complete. Validated plan and cost sent to Telegram. Awaiting proceed confirmation."
