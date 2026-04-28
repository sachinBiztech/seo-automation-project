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
7. `content-approval-[sprint_id].json` updated (Final Step B)
8. Telegram approval request sent (Final Step C)

Do not stop, do not return, do not summarise early. After each step completes, go DIRECTLY to the next step.

---

## HOW THIS ORCHESTRATOR WORKS

Each step spawns an isolated sub-agent via `sessions_spawn` with `runtime="subagent"`.
The sub-agent reads its orchestrator.md file, executes its task, writes output to disk, and returns one line.

**sessions_spawn is SYNCHRONOUS.** When sessions_spawn returns, the sub-agent has ALREADY completed and the file is ALREADY written to disk. Do NOT perform any independent file existence check after sessions_spawn. Trust the sub-agent's reply text and proceed IMMEDIATELY to the next step.

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

## Resume Logic (from_step)

Before running any step, read `from_step` from `pipeline-context-[task_id].json`.
Map it to a step index:
- null / not set → run all steps (index 0)
- "writer"   → skip Step 1 (index 1)
- "editor"   → skip Steps 1–2 (index 2)
- "graphics" → skip Steps 1–3 (index 3)
- "preview"  → skip Steps 1–4 (index 4)

For each skipped step: verify the expected output file already exists on disk.
If the file does NOT exist, run that step anyway regardless of from_step value.

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

Documents output: `seo-automation/outputs/content-pipeline/content-brief-[slug].json`
If sub-agent replies with an error (not ✅): STOP. Reply: "❌ Content pipeline FAILED at Step 1 (Strategist) for [slug]."

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

Documents output: `seo-automation/outputs/content-pipeline/draft-[slug].md`
If sub-agent replies with an error (not ✅): STOP. Reply: "❌ Content pipeline FAILED at Step 2 (Writer) for [slug]."

✅ Step 2 done — proceed IMMEDIATELY to Step 2b (Word Count Gate). You are NOT finished.

---

### Step 2b — Word Count Gate

After Step 2 completes, before proceeding to the editor:

1. Read `seo-automation/outputs/content-pipeline/draft-[slug].md`
2. Count words by splitting on whitespace
3. If word count ≥ 1,500: proceed to Step 3.
4. If word count < 1,500:
   - Delete the existing draft file (it is below minimum)
   - Spawn a writer retry sub-agent:
   ```
   runtime: "subagent"
   agentId: "content-pipeline"
   lightContext: true
   cleanup: "delete"
   label: "Step 2b — Content Writer (word count retry)"
   task: "Read seo-automation/content-writer/orchestrator.md. This is a WORD COUNT RETRY. The previous draft was under 1,500 words. MINIMUM is 1,500 words. TARGET is [target_word_count]–[target_word_count+500] words. Read the content brief at seo-automation/outputs/content-pipeline/content-brief-[slug].json. Expand every H2 section to 250–350 words minimum. FAQ must have 5 questions with 150+ word answers each. Add genuine depth — specific implementation steps, client examples, real metrics. Do NOT pad with filler. Write the draft to seo-automation/outputs/content-pipeline/draft-[slug].md. Reply ONLY with: ✅ draft-[slug].md written"
   ```
   - After retry: count words again.
   - If still < 1,500: send Telegram warning and proceed (do NOT stop the pipeline).
     ```
     openclaw message send --channel telegram --target -1003829892114 --message "⚠️ Word count warning: draft-[slug].md is [count] words after retry. Target: [target_word_count]+. Sprint: [sprint_id]. Proceeding."
     ```

✅ Step 2b done — proceed IMMEDIATELY to Step 3. You are NOT finished.

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

Documents output: `seo-automation/outputs/content-pipeline/image-prompts-[slug].json`
If sub-agent replies with an error: WARNING — continue to HTML Preview with placeholder image references.

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

Documents output: `seo-automation/outputs/content-pipeline/preview-[slug].html`
If sub-agent replies with an error: STOP. Reply: "❌ Content pipeline FAILED at Step 5 (HTML Preview) for [slug]."

✅ Step 5 done — proceed IMMEDIATELY to the Final Step. You are NOT finished until pipeline-result-[task_id].json is written.

---

## ⚠️ MANDATORY CONTINUATION — DO NOT STOP HERE

After Step 5 completes, you MUST write pipeline-result-[task_id].json immediately.
You are NOT finished. The Final Step has not run yet. Execute it now.
After the Final Step, execute Final Step B (write content-approval JSON) and Final Step C (send Telegram approval request). You are NOT finished until all three are complete.

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

### Final Step B — Write content-approval-[sprint_id].json

Read `seo-automation/outputs/content-pipeline/content-approval-[sprint_id].json` if it exists.
If it does not exist, create it with `{ "sprint_id": "[sprint_id]", "items": [] }`.

Read word count from the edited draft (count words by splitting on whitespace).

Add or update the entry for this slug:
```json
{
  "slug": "[slug]",
  "task_id": "[task_id from pipeline-context]",
  "title": "[title from content-brief]",
  "keyword": "[primary_keyword from content-brief]",
  "author": "[author from eeaat_signals in content-brief]",
  "word_count": "[actual word count of edited draft]",
  "ai_score_pct": 6,
  "status": "pending_review",
  "sent_at": "[ISO8601 timestamp]",
  "html_path": "seo-automation/outputs/content-pipeline/preview-[slug].html",
  "approved_at": null,
  "approved_by": null,
  "revision_notes": null
}
```

Write the full JSON back using the write tool.

---

### Final Step C — Send Telegram approval request

Send Telegram message with article details:
```
openclaw message send --channel telegram --target -1003829892114 --message "📄 Content Ready for Review

Title: [title]
Keyword: [primary_keyword]
Author: [author]
Word count: [word_count] | AI score: 6%
Sprint: [sprint_id] | Slug: [slug]

Preview: seo-automation/outputs/content-pipeline/preview-[slug].html

Awaiting your APPROVE / REVISE / REJECT."
```

Then send the inline button message.
CRITICAL: `[task_id]` must be the INTEGER task id from `pipeline-context-[task_id].json` (e.g. `6`), NOT the sprint_id string.
Example for task_id=6: callback_data values are `content_approve|6`, `content_revise|6`, `content_reject|6`.
```
openclaw message send --channel telegram --target -1003829892114 --message "Choose action for: \"[title]\"" --buttons "[[{\"text\":\"✅ Approve\",\"callback_data\":\"content_approve|[task_id]\"},{\"text\":\"🔄 Revise\",\"callback_data\":\"content_revise|[task_id]\"},{\"text\":\"❌ Reject\",\"callback_data\":\"content_reject|[task_id]\"}]]"
```

---

## End Condition

Pipeline is complete when `preview-[slug].html` exists AND `pipeline-result-[task_id].json` is written AND `content-approval-[sprint_id].json` is updated AND Telegram approval request is sent.
Intermediate files (draft, edited-draft) may not persist after sub-agent cleanup — this is expected.

**IMPORTANT:** Always write `pipeline-result-[task_id].json` as the very last action, even if intermediate files are missing. The Node.js runner cannot proceed without it.

Reply: "✅ Content pipeline complete for [slug]. HTML preview ready. Telegram approval request sent."
