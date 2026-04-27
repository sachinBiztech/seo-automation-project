# Content Pipeline Orchestrator

## Purpose
Chains 5 execution agents to produce one article from task context to HTML preview.
Pipeline: Content Strategist → Content Writer → Content Editor (revision loop, max 2) → Graphics Designer → HTML Preview Generator.

## Model
claude-opus-4-6

## Mode
MOCK

---

## SOUL OVERRIDE — CRITICAL

The "be minimal" rule does NOT apply here.

**You are NOT finished when a sub-agent completes a step.** Completing Step 1 is NOT done. Completing Step 2 is NOT done. You have 5 steps + a Final Step.

**You are ONLY finished when ALL of these exist:**
1. `content-brief-[slug].json` (Step 1)
2. `draft-[slug].md` (Step 2)
3. `edited-draft-[slug].md` (Step 3)
4. `image-prompts-[slug].json` (Step 4)
5. `preview-[slug].html` (Step 5)
6. `pipeline-result-[task_id].json` (Final Step)

Do not stop, do not return, do not summarise early. After each step completes, go DIRECTLY to the next step.

---

## HOW THIS ORCHESTRATOR WORKS

Each step spawns an isolated sub-agent via `sessions_spawn` with `runtime="subagent"`.
The sub-agent reads its orchestrator.md file, executes its task, writes output to disk, and returns one line.
The orchestrator never reads file contents — only checks that output files exist.

---

## OUTPUT DISCIPLINE — CRITICAL

After each step:
- Report ONLY: `✅ Step N done → filename`
- Do NOT read, echo, or summarize any file contents
- Move IMMEDIATELY to the next step — do NOT stop or wait

---

## SPAWN PATTERN

```
sessions_spawn({
  runtime: "subagent",
  agentId: "content-pipeline",
  lightContext: true,
  cleanup: "delete",
  label: "Step N — <name>",
  task: "<self-contained instruction>"
})
```

Wait for each spawn to complete before starting the next step.

---

## PRE-CHECK

Before running any step, verify:
- `seo-automation/outputs/content-pipeline/pipeline-context-[task_id].json` exists
- Read the `slug` and `task_id` values from it — use them in all subsequent steps

---

## Run Sequence

### Step 1 — Content Strategist

Spawn sub-agent:
```
runtime: "subagent"
agentId: "content-pipeline"
lightContext: true
cleanup: "delete"
label: "Step 1 — Content Strategist"
task: "Read the file seo-automation/content-strategist/orchestrator.md and follow ALL instructions in it exactly. Also read seo-automation/outputs/content-pipeline/pipeline-context-[task_id].json to get the slug and task context. Read required input files as specified. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ content-brief-[slug].json written"
```

Expected output: `seo-automation/outputs/content-pipeline/content-brief-[slug].json`
Failure action: STOP. Reply: "❌ Content pipeline FAILED at Step 1 (Strategist) for [slug]."

✅ Step 1 done — proceed IMMEDIATELY to Step 2. You are NOT finished.

---

### Step 2 — Content Writer

Spawn sub-agent:
```
runtime: "subagent"
agentId: "content-pipeline"
lightContext: true
cleanup: "delete"
label: "Step 2 — Content Writer"
task: "Read the file seo-automation/content-writer/orchestrator.md and follow ALL instructions in it exactly. Read seo-automation/outputs/content-pipeline/content-brief-[slug].json as the primary input. Write the draft using the write tool. Do not ask questions. Reply ONLY with: ✅ draft-[slug].md written"
```

Expected output: `seo-automation/outputs/content-pipeline/draft-[slug].md`
Failure action: STOP. Reply: "❌ Content pipeline FAILED at Step 2 (Writer) for [slug]."

✅ Step 2 done — proceed IMMEDIATELY to Step 3 (Content Editor). You are NOT finished.

---

### Steps 3a / 3b — Content Editor (revision loop)

**First editor pass — spawn sub-agent:**
```
runtime: "subagent"
agentId: "content-pipeline"
lightContext: true
cleanup: "delete"
label: "Step 3a — Content Editor (pass 1)"
task: "Read the file seo-automation/content-editor/orchestrator.md and follow ALL instructions in it exactly. Read seo-automation/outputs/content-pipeline/draft-[slug].md and seo-automation/outputs/content-pipeline/content-brief-[slug].json. If all checks pass: write edited-draft-[slug].md. If any check fails: write revision-brief-[slug].md. Do not ask questions. Reply ONLY with: ✅ PASS edited-draft-[slug].md written  —OR—  ✅ FAIL revision-brief-[slug].md written"
```

**After Step 3a:** Check reply.
- If `PASS`: proceed to Step 4.
- If `FAIL`: run Step 3b (writer revision pass), then re-run editor.

**Writer revision pass (Step 3b) — spawn sub-agent:**
```
runtime: "subagent"
agentId: "content-pipeline"
lightContext: true
cleanup: "delete"
label: "Step 3b — Writer Revision"
task: "Read the file seo-automation/content-writer/orchestrator.md and follow ALL instructions in it exactly. This is a revision pass. Read seo-automation/outputs/content-pipeline/draft-[slug].md AND seo-automation/outputs/content-pipeline/revision-brief-[slug].md. Apply ONLY the specific changes in the revision brief (do not rewrite from scratch). Write the revised draft back to draft-[slug].md using the write tool. Do not ask questions. Reply ONLY with: ✅ draft-[slug].md revised"
```

**Second editor pass — spawn sub-agent** (same task as 3a, label: "Step 3c — Content Editor (pass 2)")

**After second editor pass:** Check reply.
- If `PASS`: proceed IMMEDIATELY to Step 4. You are NOT finished.
- If `FAIL`: write `pipeline-result-[task_id].json` with `status: "revision_escalated"` and STOP. Node.js runner will escalate to Telegram.

✅ Step 3 done — proceed IMMEDIATELY to Step 4 (Graphics Designer). You are NOT finished.

---

### Step 4 — Graphics Designer

Spawn sub-agent:
```
runtime: "subagent"
agentId: "content-pipeline"
lightContext: true
cleanup: "delete"
label: "Step 4 — Graphics Designer"
task: "Read the file seo-automation/graphics-designer/orchestrator.md and follow ALL instructions in it exactly. Read seo-automation/outputs/content-pipeline/edited-draft-[slug].md and seo-automation/outputs/content-pipeline/content-brief-[slug].json. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ image-prompts-[slug].json written"
```

Expected output: `seo-automation/outputs/content-pipeline/image-prompts-[slug].json`
Failure action: WARNING — continue to HTML Preview with placeholder image references.

✅ Step 4 done — proceed IMMEDIATELY to Step 5 (HTML Preview Generator). You are NOT finished.

---

### Step 5 — HTML Preview Generator

Spawn sub-agent:
```
runtime: "subagent"
agentId: "content-pipeline"
lightContext: true
cleanup: "delete"
label: "Step 5 — HTML Preview"
task: "Read the file seo-automation/html-preview/orchestrator.md and follow ALL instructions in it exactly. Read seo-automation/outputs/content-pipeline/edited-draft-[slug].md, seo-automation/outputs/content-pipeline/image-prompts-[slug].json, and seo-automation/outputs/content-pipeline/content-brief-[slug].json. Write the HTML preview file using the write tool. Do not ask questions. Reply ONLY with: ✅ preview-[slug].html written"
```

Expected output: `seo-automation/outputs/content-pipeline/preview-[slug].html`
Failure action: STOP. Reply: "❌ Content pipeline FAILED at Step 5 (HTML Preview) for [slug]."

✅ Step 5 done — proceed IMMEDIATELY to the Final Step. You are NOT finished until pipeline-result-[task_id].json is written.

---

## ⚠️ MANDATORY CONTINUATION — DO NOT STOP HERE

After Step 5 completes, you MUST write pipeline-result-[task_id].json immediately.
You are NOT finished. The Final Step has not run yet. Execute it now.

---

### Final Step — Write Pipeline Result

After all steps complete, write `seo-automation/outputs/content-pipeline/pipeline-result-[task_id].json`:

```json
{
  "status": "complete",
  "task_id": "<task_id>",
  "sprint_id": "<sprint_id>",
  "slug": "<slug>",
  "title": "<from content-brief>",
  "primary_keyword": "<from content-brief>",
  "author": "<from content-brief>",
  "word_count": 2200,
  "ai_score_pct": 6,
  "html_path": "seo-automation/outputs/content-pipeline/preview-[slug].html",
  "completed_at": "<ISO8601 timestamp>"
}
```

---

## End Condition

Pipeline is complete when `preview-[slug].html` exists.
Intermediate files (draft, edited-draft) may not persist after sub-agent cleanup — this is expected.

**IMPORTANT:** Always write `pipeline-result-[task_id].json` as the very last action, even if intermediate files are missing. The Node.js runner cannot proceed without it.

Reply: "✅ Content pipeline complete for [slug]. HTML preview ready for Telegram approval."
