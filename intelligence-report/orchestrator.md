# Intelligence Report Orchestrator — BiztechCS

## Purpose
Run the complete Intelligence Report pipeline using mock SEO data.
Produces report-summary.json, intelligence-report.md, intelligence-report.html and sends Telegram report.

## Mode
MOCK

## Model
claude-sonnet-4-6

---

## HOW THIS ORCHESTRATOR WORKS

Each step spawns an isolated sub-agent via `sessions_spawn` with `runtime="subagent"`.
The sub-agent runs the subskill in its own clean context window, writes output to disk, and returns one line.
The orchestrator never reads JSON content — only checks that output files exist.

**This prevents context overflow regardless of pipeline length.**

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
  agentId: "intelligence-report",
  lightContext: true,
  cleanup: "delete",
  label: "Step N — <name>",
  task: "<self-contained instruction for the subskill>"
})
```

Wait for each spawn to complete before starting the next step.
Check the result: if the sub-agent replies with ❌, treat as failure per the step's failure action.

**CRITICAL: Do NOT generate any conversational text mid-pipeline. Do NOT stop to report progress. Do NOT say "I'll wait" or "running now". Run ALL steps to completion, THEN reply once.**

---

## Run Sequence

### Step 1 — Pull GSC Data

Spawn sub-agent:
```
runtime: "subagent"
agentId: "intelligence-report"
lightContext: true
cleanup: "delete"
label: "Step 1 — GSC Data"
task: "Read the file seo-automation/intelligence-report/subskills/pull-gsc-data.md and follow ALL instructions in it exactly. Read mock data, process it, write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ gsc-findings.json written"
```

Expected output file: `seo-automation/outputs/gsc-findings.json`
Failure action: STOP. Send Telegram alert: "❌ Intelligence Report FAILED at Step 1 (GSC Data)."

---

### Step 2 — Pull GA4 Data

Spawn sub-agent:
```
runtime: "subagent"
agentId: "intelligence-report"
lightContext: true
cleanup: "delete"
label: "Step 2 — GA4 Data"
task: "Read the file seo-automation/intelligence-report/subskills/pull-ga4-data.md and follow ALL instructions in it exactly. Read mock data, process it, write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ ga4-findings.json written"
```

Expected output file: `seo-automation/outputs/ga4-findings.json`
Failure action: STOP. Send Telegram alert: "❌ Intelligence Report FAILED at Step 2 (GA4 Data)."

---

### Step 3 — Pull Ranking Data

Spawn sub-agent:
```
runtime: "subagent"
agentId: "intelligence-report"
lightContext: true
cleanup: "delete"
label: "Step 3 — Ranking Data"
task: "Read the file seo-automation/intelligence-report/subskills/pull-ranking-data.md and follow ALL instructions in it exactly. Read mock data, process it, write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ ranking-findings.json written"
```

Expected output file: `seo-automation/outputs/ranking-findings.json`
Failure action: STOP. Send Telegram alert: "❌ Intelligence Report FAILED at Step 3 (Ranking Data)."

---

### Step 4 — Pull Odoo Lead Data

Spawn sub-agent:
```
runtime: "subagent"
agentId: "intelligence-report"
lightContext: true
cleanup: "delete"
label: "Step 4 — Odoo Leads"
task: "Read the file seo-automation/intelligence-report/subskills/pull-odoo-leads.md and follow ALL instructions in it exactly. Read mock data, process it, write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ odoo-findings.json written"
```

Expected output file: `seo-automation/outputs/odoo-findings.json`
Failure action: STOP. Send Telegram alert: "❌ Intelligence Report FAILED at Step 4 (Odoo Data)."

---

### Step 4.5 — Pull Clarity Data

Spawn sub-agent:
```
runtime: "subagent"
agentId: "intelligence-report"
lightContext: true
cleanup: "delete"
label: "Step 4.5 — Clarity Data"
task: "Read the file seo-automation/intelligence-report/subskills/pull-clarity-data.md and follow ALL instructions in it exactly. Read mock data, process it, write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ clarity-findings.json written"
```

Expected output file: `seo-automation/outputs/clarity-findings.json`
Failure action: WARNING only — continue even if this step fails. Clarity is a behavioural layer, not critical path.

---

### Step 5 — Competitor Monitor

Spawn sub-agent:
```
runtime: "subagent"
agentId: "intelligence-report"
lightContext: true
cleanup: "delete"
label: "Step 5 — Competitor Monitor"
task: "Read the file seo-automation/intelligence-report/subskills/competitor-monitor.md and follow ALL instructions in it exactly. Read mock data, process it, write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ competitor-findings.json written"
```

Expected output file: `seo-automation/outputs/competitor-findings.json`
Failure action: WARNING only — continue even if this step fails.

---

### Step 6 — Algorithm Signals

Spawn sub-agent:
```
runtime: "subagent"
agentId: "intelligence-report"
lightContext: true
cleanup: "delete"
label: "Step 6 — Algorithm Signals"
task: "Read the file seo-automation/intelligence-report/subskills/algorithm-signals.md and follow ALL instructions in it exactly. Read mock data, process it, write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ algorithm-findings.json written"
```

Expected output file: `seo-automation/outputs/algorithm-findings.json`
Failure action: WARNING only — continue even if this step fails.

---

### Step 7 — Analyze Data

Spawn sub-agent:
```
runtime: "subagent"
agentId: "intelligence-report"
lightContext: true
cleanup: "delete"
label: "Step 7 — Analyze Data"
task: "Read the file seo-automation/intelligence-report/subskills/analyze-data.md and follow ALL instructions in it exactly. Read all findings files from seo-automation/outputs/ as specified. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ analysis-findings.json written"
```

Expected output file: `seo-automation/outputs/analysis-findings.json`
Failure action: STOP. Send Telegram alert: "❌ Intelligence Report FAILED at Step 7 (Analysis)."

---

### Step 8 — Run 20 Questions

Spawn sub-agent:
```
runtime: "subagent"
agentId: "intelligence-report"
lightContext: true
cleanup: "delete"
label: "Step 8 — 20 Questions"
task: "Read the file seo-automation/intelligence-report/subskills/run-20-questions.md and follow ALL instructions in it exactly. Read required findings files from seo-automation/outputs/ as specified. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ research-findings.json written"
```

Expected output file: `seo-automation/outputs/research-findings.json`
Failure action: STOP. Send Telegram alert: "❌ Intelligence Report FAILED at Step 8 (20 Questions)."

---

### Step 9a — Generate Insights

Spawn sub-agent:
```
runtime: "subagent"
agentId: "intelligence-report"
lightContext: true
cleanup: "delete"
label: "Step 9a — Generate Insights"
task: "Read the file seo-automation/intelligence-report/subskills/generate-insights.md and follow ALL instructions in it exactly. Read required findings files from seo-automation/outputs/ as specified. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ insights.json written"
```

Expected output file: `seo-automation/outputs/insights.json`
Failure action: STOP. Send Telegram alert: "❌ Intelligence Report FAILED at Step 9a (Insights)."

---

### Step 9b — Assemble Report

Spawn sub-agent:
```
runtime: "subagent"
agentId: "intelligence-report"
lightContext: true
cleanup: "delete"
label: "Step 9b — Assemble Report"
task: "Read the file seo-automation/intelligence-report/subskills/assemble-report.md and follow ALL instructions in it exactly. Read all required files from seo-automation/outputs/ as specified. Write all three output files (report-summary.json, intelligence-report.md, intelligence-report.html) using the write tool. Do not ask questions. Reply ONLY with: ✅ report-summary.json + intelligence-report.md + intelligence-report.html written"
```

Expected output files:
- `seo-automation/outputs/report-summary.json`
- `seo-automation/outputs/intelligence-report.md`
- `seo-automation/outputs/intelligence-report.html`

Failure action: STOP. Send Telegram alert: "❌ Intelligence Report FAILED at Step 9b (Assembly)."

---

### Step 10 — Generate PDF

Spawn sub-agent:
```
runtime: "subagent"
agentId: "intelligence-report"
lightContext: true
cleanup: "delete"
label: "Step 10 — Generate PDF"
task: "Read the file seo-automation/intelligence-report/subskills/generate-pdf.md and follow ALL instructions in it exactly. Do not ask questions. Reply ONLY with: ✅ generate-pdf-status.json written"
```

Expected output file: `seo-automation/outputs/generate-pdf-status.json`
Failure action: WARNING — write `status: "html_fallback"` and continue. Do NOT stop.

---

### Step 11 — Deliver Report

Spawn sub-agent:
```
runtime: "subagent"
agentId: "intelligence-report"
lightContext: true
cleanup: "delete"
label: "Step 11 — Deliver Report"
task: "Read the file seo-automation/intelligence-report/subskills/deliver-report.md and follow ALL instructions in it exactly. Do not ask questions. Reply ONLY with: ✅ report delivered + report-approval.json written"
```

Expected output file: `seo-automation/outputs/report-approval.json`
Failure action: STOP. Send Telegram alert: "❌ Intelligence Report delivery FAILED at Step 11."

---

## End Condition

Pipeline is complete when:
- `report-summary.json` exists and is non-empty
- `report-approval.json` exists with `status: "approved"`
- Telegram notification was sent

Reply: "✅ BiztechCS Intelligence Report pipeline complete."
