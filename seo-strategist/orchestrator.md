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

Each step spawns an isolated sub-agent via `sessions_spawn` with `runtime="subagent"`.
The sub-agent runs the subskill in its own clean context window, writes output to disk, and returns one line.
The orchestrator never reads JSON content — only checks that output files exist.

**This prevents context overflow regardless of pipeline length.**

---

## SOUL OVERRIDE — CRITICAL

The SOUL.md instruction "be minimal" does NOT apply here. This is an automated pipeline orchestrator, not a conversational agent.

**DO NOT write any sprint plan files directly in this orchestrator context.**
**DO NOT shortcut the pipeline by summarizing data yourself.**
**DO NOT skip steps.**

You MUST use `sessions_spawn` for EVERY step listed in Run Sequence below.
If you find yourself writing a file like `sprint-plan.json`, `seo_sprint_plan_*.json`, or any output file directly — STOP. You are doing it wrong. Spawn a subagent instead.

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

## MOCK MODE NOTE

MOCK mode means: read data from `mock-data/` files instead of live APIs.
It does NOT suppress Telegram sends or bash command execution.
All `openclaw message send` commands in subskills MUST be executed as real bash calls.

---

## SPAWN PATTERN

For every step, use `sessions_spawn` like this:

```
sessions_spawn({
  runtime: "subagent",
  agentId: "seo-strategist",
  lightContext: true,
  cleanup: "delete",
  label: "Step N — <name>",
  task: "<self-contained instruction for the subskill>"
})
```

## SPAWN SEQUENCING — CRITICAL

**NEVER spawn two steps simultaneously. You have a maximum of 5 concurrent subagent slots. Running Steps 3a + 3b + 3c + 4 + 5 at the same time will hit the limit and FAIL.**

The ONLY correct execution pattern is:
1. Spawn ONE step
2. Wait for its completion event (arrives as internal task completion message)
3. Check if output file exists
4. THEN spawn the next step

Steps 3a, 3b, 3c MUST run sequentially — spawn 3a, wait for 3a to complete, then spawn 3b, wait for 3b to complete, then spawn 3c, wait for 3c to complete.

Step 4 MUST NOT be spawned until all three of 3a, 3b, 3c have completed (even if some failed with WARNING).

After each completion event:
- If the expected output file exists on disk: treat as SUCCESS regardless of what the subagent said
- If the subagent replied with ❌ AND the file is missing: treat as failure per that step's failure action
- IMMEDIATELY spawn the next step — do NOT output any text, do NOT pause, do NOT wait for user input

**CRITICAL: Do NOT output any text between steps. Do NOT stop mid-pipeline. Do NOT say "Step N done" until ALL steps are complete. Run every step from 0 through 6 in one continuous execution, then output a single final summary.**

---

## PRE-CHECK

Before running any step, verify:
- `seo-automation/outputs/report-summary.json` exists and is non-empty
- `seo-automation/outputs/report-approval.json` has `status: "approved"`

If either check fails: STOP. Reply "❌ Cannot run strategist — report not approved."

---

## Run Sequence

### Step 0 — Cleanup Stale Outputs

Before spawning any subagent, run this bash command to delete stale files from previous runs:

```bash
rm -f \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/intelligence-brief-parsed.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/attack-vectors.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/content-plan.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/technical-plan.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/offpage-plan.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/sprint-plan.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/sprint-plan.md \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/sprint-plan.html \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/generate-sprint-pdf-status.json \
  /home/sachin.p/.openclaw/workspace/seo-automation/outputs/sprint-approval.json
```

This ensures every run starts fresh. Do NOT skip this step.

---

### Step 1 — Parse Intelligence Brief

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step 1 — Intelligence Brief"
task: "Read the file seo-automation/seo-strategist/subskills/read-intelligence-brief.md and follow ALL instructions in it exactly. Read required files from seo-automation/outputs/ as specified. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ intelligence-brief-parsed.json written"
```

Expected output file: `seo-automation/outputs/intelligence-brief-parsed.json`
Failure action: STOP. Send Telegram alert: "❌ BiztechCS Sprint Planning FAILED at Step 1 (Brief Parse)."

---

### Step 2 — Identify Attack Vectors

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step 2 — Attack Vectors"
task: "Read the file seo-automation/seo-strategist/subskills/identify-attack-vectors.md and follow ALL instructions in it exactly. Read required files from seo-automation/outputs/ as specified. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ attack-vectors.json written"
```

Expected output file: `seo-automation/outputs/attack-vectors.json`
Failure action: STOP. Send Telegram alert: "❌ BiztechCS Sprint Planning FAILED at Step 2 (Attack Vectors)."

---

### Step 3a — Build Content Offensive

**Spawn, then WAIT for completion before spawning Step 3b.**

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step 3a — Content Offensive"
task: "Read the file seo-automation/seo-strategist/subskills/build-content-offensive.md and follow ALL instructions in it exactly. Read required files from seo-automation/outputs/ as specified. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ content-plan.json written"
```

Expected output file: `seo-automation/outputs/content-plan.json`
Failure action: WARNING only — continue even if this step fails.

---

### Step 3b — Build Technical Offensive

**Spawn only after Step 3a completion event received. Wait for Step 3b completion before spawning Step 3c.**

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step 3b — Technical Offensive"
task: "Read the file seo-automation/seo-strategist/subskills/build-technical-offensive.md and follow ALL instructions in it exactly. Read required files from seo-automation/outputs/ as specified. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ technical-plan.json written"
```

Expected output file: `seo-automation/outputs/technical-plan.json`
Failure action: WARNING only — continue even if this step fails.

---

### Step 3c — Build Off-Page Offensive

**Spawn only after Step 3b completion event received. Wait for Step 3c completion before spawning Step 4.**

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step 3c — Off-Page Offensive"
task: "Read the file seo-automation/seo-strategist/subskills/build-offpage-offensive.md and follow ALL instructions in it exactly. Read required files from seo-automation/outputs/ as specified. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ offpage-plan.json written"
```

Expected output file: `seo-automation/outputs/offpage-plan.json`
Failure action: WARNING only — continue even if this step fails.

If all three of 3a, 3b, 3c fail: STOP. Send Telegram alert: "❌ BiztechCS Sprint Planning FAILED at Step 3 (All plans failed)."

---

### Step 4 — Assemble Sprint Plan

**WAIT GATE: Do NOT spawn Step 4 until Step 3c completion event has been received. Verify at least one of content-plan.json, technical-plan.json, offpage-plan.json exists before spawning.**

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step 4 — Assemble Sprint Plan"
task: "Read the file seo-automation/seo-strategist/subskills/assemble-sprint-plan.md and follow ALL instructions in it exactly. Read all required files from seo-automation/outputs/ as specified. Write all three output files (sprint-plan.json, sprint-plan.md, sprint-plan.html) using the write tool. Do not ask questions. Reply ONLY with: ✅ sprint-plan.json + sprint-plan.md + sprint-plan.html written"
```

Expected output files:
- `seo-automation/outputs/sprint-plan.json`
- `seo-automation/outputs/sprint-plan.md`
- `seo-automation/outputs/sprint-plan.html`

Failure action: STOP. Send Telegram alert: "❌ BiztechCS Sprint Planning FAILED at Step 4 (Assembly)."

---

### Step 5 — Generate Sprint PDF

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step 5 — Generate Sprint PDF"
task: "Read the file seo-automation/seo-strategist/subskills/generate-sprint-pdf.md and follow ALL instructions in it exactly. Do not ask questions. Reply ONLY with: ✅ generate-sprint-pdf-status.json written"
```

Expected output file: `seo-automation/outputs/generate-sprint-pdf-status.json`
Failure action: WARNING — write `status: "html_fallback"` and continue. Do NOT stop.

---

### Step 6 — Deliver Sprint Plan

Spawn sub-agent:
```
runtime: "subagent"
agentId: "seo-strategist"
lightContext: true
cleanup: "delete"
label: "Step 6 — Deliver Sprint Plan"
task: "Read the file seo-automation/seo-strategist/subskills/deliver-sprint-plan.md and follow ALL instructions in it exactly. Do not ask questions. Reply ONLY with: ✅ sprint plan delivered + sprint-approval.json written"
```

Expected output file: `seo-automation/outputs/sprint-approval.json`
Failure action: STOP. Send Telegram alert: "❌ BiztechCS sprint plan delivery FAILED at Step 6."

---

## End Condition

Pipeline is complete when:
- `sprint-plan.json` exists and is non-empty
- `sprint-approval.json` exists with `status: "pending"`
- Sprint plan PDF (or HTML fallback) sent to Telegram for human approval

Reply: "✅ BiztechCS SEO Sprint Plan sent to Telegram. Awaiting human approval."
