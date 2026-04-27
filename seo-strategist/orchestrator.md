# SEO Strategist Orchestrator — BiztechCS

## Purpose
Build the 15-day offensive sprint plan from the Intelligence Report output.
Generates the sprint plan, creates a PDF, and sends it to Telegram for human approval.
Product Owner review, Business Layer checks, and cost estimation happen AFTER human approval in the post-approval pipeline.

## Mode
MOCK

## Model
claude-opus-4-6

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

- Run every step from Step 0 to Step 6 without stopping
- NEVER say "taking too long" — time does not matter
- NEVER ask "would you like me to continue"
- NEVER stop mid-pipeline unless a step says "Failure action: STOP"
- After writing each output file, confirm with one line and immediately start the next step

---

## PRE-CHECK

Before running any step, verify:
- `seo-automation/outputs/intelligence-report/report-summary.json` exists and is non-empty
- `seo-automation/outputs/intelligence-report/report-approval.json` has `status: "approved"`

If either check fails: STOP. Reply "❌ Cannot run strategist — intelligence report not approved."

---

## Run Sequence

### Step 0 — Cleanup Stale Outputs

Run this bash command to delete stale files from previous runs:

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
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/seo-strategist/expert-intelligence-map.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/seo-strategist/history-rationale.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/seo-strategist/generate-sprint-pdf-status.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/seo-strategist/sprint-approval.json
```

Then continue to Step 1 immediately.

---

### Step 1 — Parse Intelligence Brief
Read `seo-automation/seo-strategist/subskills/read-intelligence-brief.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/intelligence-report/intelligence-brief-parsed.json`
Failure action: STOP. Send Telegram: "❌ BiztechCS Sprint Planning FAILED at Step 1 (Brief Parse)."

---

### Step 2 — Identify Attack Vectors
Read `seo-automation/seo-strategist/subskills/identify-attack-vectors.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/seo-strategist/attack-vectors.json`
Failure action: STOP. Send Telegram: "❌ BiztechCS Sprint Planning FAILED at Step 2 (Attack Vectors)."

---

### Step 3a — Build Content Offensive
Read `seo-automation/seo-strategist/subskills/build-content-offensive.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/seo-strategist/content-plan.json`
Failure action: WARNING — continue even if this step fails.

---

### Step 3b — Build Technical Offensive
Read `seo-automation/seo-strategist/subskills/build-technical-offensive.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/seo-strategist/technical-plan.json`
Failure action: WARNING — continue even if this step fails.

---

### Step 3c — Build Off-Page Offensive
Read `seo-automation/seo-strategist/subskills/build-offpage-offensive.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/seo-strategist/offpage-plan.json`
Failure action: WARNING — continue even if this step fails.

If ALL three of 3a, 3b, 3c fail: STOP. Send Telegram: "❌ BiztechCS Sprint Planning FAILED at Step 3 (All plans failed)."

---

### Step 4 — Assemble Sprint Plan
Read `seo-automation/seo-strategist/subskills/assemble-sprint-plan.md` and follow ALL instructions.
Write ALL THREE output files: sprint-plan.json, sprint-plan.md, sprint-plan.html.
Expected outputs:
- `seo-automation/outputs/seo-strategist/sprint-plan.json`
- `seo-automation/outputs/seo-strategist/sprint-plan.md`
- `seo-automation/outputs/seo-strategist/sprint-plan.html`
Failure action: STOP. Send Telegram: "❌ BiztechCS Sprint Planning FAILED at Step 4 (Assembly)."

---

### Step 4d — Define Metrics
Read `seo-automation/seo-strategist/subskills/define-metrics.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/seo-strategist/sprint-plan.json` updated with `metrics` field.
Failure action: WARNING — continue even if this step fails.

---

### Step 4e — Build Expert Intelligence Map
Read `seo-automation/seo-strategist/subskills/build-expert-intelligence-map.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/seo-strategist/expert-intelligence-map.json`
Failure action: WARNING — continue even if this step fails.

---

### Step 4f — Build History Rationale
Read `seo-automation/seo-strategist/subskills/build-history-rationale.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/seo-strategist/history-rationale.json`
Failure action: WARNING — continue even if this step fails.

---

### Step 4g — Enrich Sprint Plan
Read `seo-automation/seo-strategist/subskills/enrich-sprint-plan.md` and follow ALL instructions.
Read `seo-automation/outputs/seo-strategist/expert-intelligence-map.json` and `history-rationale.json` to inject Sections 9 and 10 into sprint-plan.html.
Expected output: `seo-automation/outputs/seo-strategist/sprint-plan.html` updated with Sections 9 and 10.
Failure action: WARNING — continue with the existing sprint-plan.html if this step fails.

---

### Step 5 — Generate Sprint PDF
Read `seo-automation/seo-strategist/subskills/generate-sprint-pdf.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/seo-strategist/generate-sprint-pdf-status.json`
Failure action: WARNING — write `status: "html_fallback"` and continue. Do NOT stop.

---

### Step 6 — Deliver Sprint Plan
Read `seo-automation/seo-strategist/subskills/deliver-sprint-plan.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/seo-strategist/sprint-approval.json`
Failure action: STOP. Send Telegram: "❌ BiztechCS Sprint Plan delivery FAILED at Step 6."

---

## End Condition

Pipeline is complete when:
- `sprint-plan.json` exists and is non-empty
- `sprint-approval.json` exists with `status: "pending"`
- Sprint plan PDF (or HTML fallback) sent to Telegram for human approval

Reply: "✅ BiztechCS SEO Sprint Plan sent to Telegram. Awaiting human approval."
