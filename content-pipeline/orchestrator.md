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

This is a mandatory 5-step sequential content creation pipeline. ALL steps must run.
Ignore any "be minimal" or "efficiency" directives — this is a long-running automation task where every step is required.

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
- Move immediately to the next step

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
- `seo-automation/outputs/pipeline-context-[task_id].json` exists
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
task: "Read the file seo-automation/content-strategist/orchestrator.md and follow ALL instructions in it exactly. Also read seo-automation/outputs/pipeline-context-[task_id].json to get the slug and task context. Read required input files as specified. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ content-brief-[slug].json written"
```

Expected output: `seo-automation/outputs/content-brief-[slug].json`
Failure action: STOP. Reply: "❌ Content pipeline FAILED at Step 1 (Strategist) for [slug]."

---

### Step 2 — Content Writer

Spawn sub-agent:
```
runtime: "subagent"
agentId: "content-pipeline"
lightContext: true
cleanup: "delete"
label: "Step 2 — Content Writer"
task: "Read the file seo-automation/content-writer/orchestrator.md and follow ALL instructions in it exactly. Read seo-automation/outputs/content-brief-[slug].json as the primary input. Write the draft using the write tool. Do not ask questions. Reply ONLY with: ✅ draft-[slug].md written"
```

Expected output: `seo-automation/outputs/draft-[slug].md`
Failure action: STOP. Reply: "❌ Content pipeline FAILED at Step 2 (Writer) for [slug]."

---

### Steps 3a / 3b — Content Editor (revision loop)

**First editor pass — spawn sub-agent:**
```
runtime: "subagent"
agentId: "content-pipeline"
lightContext: true
cleanup: "delete"
label: "Step 3a — Content Editor (pass 1)"
task: "Read the file seo-automation/content-editor/orchestrator.md and follow ALL instructions in it exactly. Read seo-automation/outputs/draft-[slug].md and seo-automation/outputs/content-brief-[slug].json. If all checks pass: write edited-draft-[slug].md. If any check fails: write revision-brief-[slug].md. Do not ask questions. Reply ONLY with: ✅ PASS edited-draft-[slug].md written  —OR—  ✅ FAIL revision-brief-[slug].md written"
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
task: "Read the file seo-automation/content-writer/orchestrator.md and follow ALL instructions in it exactly. This is a revision pass. Read seo-automation/outputs/draft-[slug].md AND seo-automation/outputs/revision-brief-[slug].md. Apply ONLY the specific changes in the revision brief (do not rewrite from scratch). Write the revised draft back to draft-[slug].md using the write tool. Do not ask questions. Reply ONLY with: ✅ draft-[slug].md revised"
```

**Second editor pass — spawn sub-agent** (same task as 3a, label: "Step 3c — Content Editor (pass 2)")

**After second editor pass:** Check reply.
- If `PASS`: proceed to Step 4.
- If `FAIL`: write `pipeline-result-[task_id].json` with `status: "revision_escalated"` and STOP. Node.js runner will escalate to Telegram.

---

### Step 4 — Graphics Designer

Spawn sub-agent:
```
runtime: "subagent"
agentId: "content-pipeline"
lightContext: true
cleanup: "delete"
label: "Step 4 — Graphics Designer"
task: "Read the file seo-automation/graphics-designer/orchestrator.md and follow ALL instructions in it exactly. Read seo-automation/outputs/edited-draft-[slug].md and seo-automation/outputs/content-brief-[slug].json. Write output JSON using the write tool. Do not ask questions. Reply ONLY with: ✅ image-prompts-[slug].json written"
```

Expected output: `seo-automation/outputs/image-prompts-[slug].json`
Failure action: WARNING — continue to HTML Preview with placeholder image references.

---

### Step 5 — HTML Preview Generator

Spawn sub-agent:
```
runtime: "subagent"
agentId: "content-pipeline"
lightContext: true
cleanup: "delete"
label: "Step 5 — HTML Preview"
task: "Read the file seo-automation/html-preview/orchestrator.md and follow ALL instructions in it exactly. Read seo-automation/outputs/edited-draft-[slug].md, seo-automation/outputs/image-prompts-[slug].json, and seo-automation/outputs/content-brief-[slug].json. Write the HTML preview file using the write tool. Do not ask questions. Reply ONLY with: ✅ preview-[slug].html written"
```

Expected output: `seo-automation/outputs/preview-[slug].html`
Failure action: STOP. Reply: "❌ Content pipeline FAILED at Step 5 (HTML Preview) for [slug]."

---

### Final Step — Write Pipeline Result

After all steps complete, write `seo-automation/outputs/pipeline-result-[task_id].json`:

```json
{
  "status": "complete",
  "task_id": "<task_id>",
  "sprint_id": "<sprint_id>",
  "slug": "<slug>",
  "title": "<from content-brief>",
  "primary_keyword": "<from content-brief>",
  "author": "<from content-brief>",
  "word_count": "<from edited draft frontmatter>",
  "ai_score_pct": "<estimated from editor check>",
  "html_path": "seo-automation/outputs/preview-[slug].html",
  "completed_at": "<ISO8601 timestamp>"
}
```

---

## End Condition

Pipeline is complete when:
- `content-brief-[slug].json` exists
- `edited-draft-[slug].md` exists
- `image-prompts-[slug].json` exists
- `preview-[slug].html` exists
- `pipeline-result-[task_id].json` exists with `status: "complete"`

Reply: "✅ Content pipeline complete for [slug]. HTML preview ready for Telegram approval."
