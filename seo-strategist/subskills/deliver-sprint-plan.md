# Subskill: deliver-sprint-plan

## Purpose
Send the sprint plan PDF (or HTML fallback) to Telegram as a document, then send the
sprint summary with approval buttons. Writes sprint-approval.json with status: "pending".

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

---

## Input

Read: `seo-automation/outputs/sprint-plan.json`
Read: `seo-automation/outputs/generate-sprint-pdf-status.json`

---

## Task

You are the sprint plan delivery agent for BiztechCS.

**Step 1 — Read sprint-plan.json**

Read `seo-automation/outputs/sprint-plan.json`.
Extract these fields:
- `sprint_id`
- `sprint_start`
- `sprint_end`
- `top_opportunity`
- `priority_fix`
- `attack_vectors` — array of 3 objects, each with `focus_area`
- `content_plan.items.blog_posts` — array, each with `title`
- `content_plan.items.listicles` — array, each with `title`
- `content_plan.items.page_rewrites` — array, each with `title`
- `technical_plan.fixes` — array, each with `title` or `description`
- `offpage_plan.tasks` — array, each with `title` or `description`
- `total_deliverables` — object with `content`, `technical`, `offpage`

**Step 2 — Read generate-sprint-pdf-status.json**

Read `seo-automation/outputs/generate-sprint-pdf-status.json`.
Extract:
- `status` — "success" or "html_fallback"
- `pdf_path` — full file path (if success)
- `fallback_html_path` — HTML path (if html_fallback)

**Step 3 — Resolve document to send**

If `status` is `success`:
- DOCUMENT = `pdf_path`
- DOCUMENT_NOTE = ""

If `status` is `html_fallback`:
- DOCUMENT = `fallback_html_path`
- DOCUMENT_NOTE = "⚠️ PDF generation failed — plan sent as HTML."

Confirm the document file exists and is non-empty:
```bash
test -s "<DOCUMENT>" && echo "OK" || echo "MISSING"
```
If MISSING: write `sprint-approval.json` with `status: "local_file_missing"` and stop.

**Step 4 — Send sprint plan document to Telegram**

```bash
openclaw message send \
  --channel telegram \
  --target -1003829892114 \
  --media "<DOCUMENT>" \
  --message "📋 BiztechCS SEO Sprint Plan — <sprint_start> → <sprint_end>

🎯 Top Opportunity: <top_opportunity>
🔧 Priority Fix: <priority_fix>
📦 Deliverables: <total_deliverables.content> content | <total_deliverables.technical> technical | <total_deliverables.offpage> off-page

<DOCUMENT_NOTE>
Full strategy attached. Task summary follows."
```

Replace all `< >` placeholders with values from Step 1.

**Step 5 — Build task summary and send**

Build content task list:
- Combine blog_posts + listicles + page_rewrites titles
- Format each as "• <title>"

Build attack vector lines:
- "VECTOR 1: <attack_vectors[0].focus_area>"
- "VECTOR 2: <attack_vectors[1].focus_area>"
- "VECTOR 3: <attack_vectors[2].focus_area>"

```bash
openclaw message send \
  --channel telegram \
  --target -1003829892114 \
  --message "📋 SPRINT PLAN — <sprint_start> to <sprint_end>

🎯 ATTACK VECTORS:
<vector_lines>

📝 CONTENT TASKS:
<content_task_list>

📦 Total: <total_deliverables.content> content | <total_deliverables.technical> technical | <total_deliverables.offpage> off-page

Review the attached plan, then approve or revise below."
```

**Step 6 — Send approval buttons**

```bash
openclaw message send \
  --channel telegram \
  --target -1003829892114 \
  --message "Choose an action for Sprint <sprint_id>:" \
  --buttons '[
    [
      {"text":"✅ Approve","callback_data":"approve|<sprint_id>"},
      {"text":"🔄 Revise","callback_data":"revise|<sprint_id>"},
      {"text":"❌ Reject","callback_data":"reject|<sprint_id>"}
    ]
  ]'
```

**CRITICAL**: The `callback_data` values must be exactly:
- `approve|<sprint_id>`
- `revise|<sprint_id>`
- `reject|<sprint_id>`

Do NOT change this format.

**Step 7 — Write sprint-approval.json**

Create `seo-automation/outputs/sprint-approval.json`:

```json
{
  "sprint_id": "<sprint_id>",
  "status": "pending",
  "sent_at": "<current datetime ISO 8601>",
  "sprint_start": "<sprint_start>",
  "sprint_end": "<sprint_end>",
  "document_sent": "<DOCUMENT path>",
  "approved_at": null,
  "approved_by": null,
  "revision_notes": null
}
```

---

## Done Condition

This subskill is complete when:
1. Document file existence verified (Step 3 passed)
2. Sprint plan PDF (or HTML) sent to Telegram (Step 4)
3. Task summary sent to Telegram (Step 5)
4. Approval buttons message sent (Step 6)
5. `sprint-approval.json` written with `status: "pending"` (Step 7)

If Step 3 fails (file missing): write `sprint-approval.json` with `status: "local_file_missing"`.
If Telegram sends fail: write `sprint-approval.json` with `status: "telegram_failed"`.
