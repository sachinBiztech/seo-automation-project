# Intelligence Report Orchestrator — BiztechCS

## Purpose
Run the complete Intelligence Report pipeline using mock SEO data.
Produces report-summary.json, intelligence-report.md, intelligence-report.html and sends Telegram report.

## Mode
MOCK

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

- Run every step from Step 1 to Step 11 without stopping
- NEVER say "taking too long" — time does not matter
- NEVER ask "would you like me to continue"
- NEVER stop mid-pipeline unless a step says "Failure action: STOP"
- After writing each output file, confirm with one line and immediately start the next step

---

## Run Sequence

### Step 1 — Pull GSC Data
Read `seo-automation/intelligence-report/subskills/pull-gsc-data.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/intelligence-report/gsc-findings.json`
Failure action: STOP. Send Telegram: "❌ Intelligence Report FAILED at Step 1 (GSC Data)."

---

### Step 2 — Pull GA4 Data
Read `seo-automation/intelligence-report/subskills/pull-ga4-data.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/intelligence-report/ga4-findings.json`
Failure action: STOP. Send Telegram: "❌ Intelligence Report FAILED at Step 2 (GA4 Data)."

---

### Step 3 — Pull Ranking Data
Read `seo-automation/intelligence-report/subskills/pull-ranking-data.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/intelligence-report/ranking-findings.json`
Failure action: STOP. Send Telegram: "❌ Intelligence Report FAILED at Step 3 (Ranking Data)."

---

### Step 4 — Pull Odoo Lead Data
Read `seo-automation/intelligence-report/subskills/pull-odoo-leads.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/intelligence-report/odoo-findings.json`
Failure action: STOP. Send Telegram: "❌ Intelligence Report FAILED at Step 4 (Odoo Data)."

---

### Step 4.5 — Pull Clarity Data
Read `seo-automation/intelligence-report/subskills/pull-clarity-data.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/intelligence-report/clarity-findings.json`
Failure action: WARNING — continue even if this step fails.

---

### Step 5 — Competitor Monitor
Read `seo-automation/intelligence-report/subskills/competitor-monitor.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/intelligence-report/competitor-findings.json`
Failure action: WARNING — continue even if this step fails.

---

### Step 6 — Algorithm Signals
Read `seo-automation/intelligence-report/subskills/algorithm-signals.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/intelligence-report/algorithm-findings.json`
Failure action: WARNING — continue even if this step fails.

---

### Step 7 — Analyze Data
Read `seo-automation/intelligence-report/subskills/analyze-data.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/intelligence-report/analysis-findings.json`
Failure action: STOP. Send Telegram: "❌ Intelligence Report FAILED at Step 7 (Analysis)."

---

### Step 8 — Run 20 Questions
Read `seo-automation/intelligence-report/subskills/run-20-questions.md` and follow ALL instructions.
Also read `seo-automation/mock-data/competitor-position-table-mock.json` for Q10.
Write BOTH output files: research-findings.json AND competitor-position-table.json.
Expected outputs:
- `seo-automation/outputs/intelligence-report/research-findings.json`
- `seo-automation/outputs/intelligence-report/competitor-position-table.json`
Failure action: STOP. Send Telegram: "❌ Intelligence Report FAILED at Step 8 (20 Questions)."

---

### Step 9a — Generate Insights
Read `seo-automation/intelligence-report/subskills/generate-insights.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/intelligence-report/insights.json`
Failure action: STOP. Send Telegram: "❌ Intelligence Report FAILED at Step 9a (Insights)."

---

### Step 9b — Assemble Report
Read `seo-automation/intelligence-report/subskills/assemble-report.md` and follow ALL instructions.
Write ALL THREE output files: report-summary.json, intelligence-report.md, intelligence-report.html.
Expected outputs:
- `seo-automation/outputs/intelligence-report/report-summary.json`
- `seo-automation/outputs/intelligence-report/intelligence-report.md`
- `seo-automation/outputs/intelligence-report/intelligence-report.html`
Failure action: STOP. Send Telegram: "❌ Intelligence Report FAILED at Step 9b (Assembly)."

---

### Step 10 — Generate PDF
Read `seo-automation/intelligence-report/subskills/generate-pdf.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/intelligence-report/generate-pdf-status.json`
Failure action: WARNING — write `status: "html_fallback"` and continue.

---

### Step 11 — Deliver Report
Read `seo-automation/intelligence-report/subskills/deliver-report.md` and follow ALL instructions.
Expected output: `seo-automation/outputs/intelligence-report/report-approval.json`
Failure action: STOP. Send Telegram: "❌ Intelligence Report delivery FAILED at Step 11."

---

## End Condition

When all steps are done:
- Confirm `seo-automation/outputs/intelligence-report/report-summary.json` exists
- Confirm `seo-automation/outputs/intelligence-report/report-approval.json` exists
- Reply: `✅ BiztechCS Intelligence Report pipeline complete.`
