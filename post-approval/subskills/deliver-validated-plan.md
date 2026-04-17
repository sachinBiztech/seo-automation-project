# Subskill: deliver-validated-plan

## Purpose
Send the validated sprint plan and project cost breakdown to Telegram.
Sends a summary message with tiered task breakdown, cost, and a "Proceed → Populate Task Sheet" button.
Human clicks Proceed → triggers task-sheet-populator.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

---

## Input

Read: `seo-automation/outputs/sprint-plan.json`
Read: `seo-automation/outputs/tiered-sprint-options.json`
Read: `seo-automation/outputs/project-cost.json`
Read: `seo-automation/outputs/product-owner-review.json`
Read: `seo-automation/outputs/mql-check.json` (optional — skip gracefully if missing)

---

## Task

You are the post-approval delivery agent for BiztechCS.

**Step 1 — Read inputs**

Read `seo-automation/outputs/sprint-plan.json`.
Extract: `sprint_id`, `sprint_start`, `sprint_end`.

Read `seo-automation/outputs/tiered-sprint-options.json`.
Extract:
- `tiers.priority_1.items[*].title` — P1 task list
- `tiers.priority_2.items[*].title` — P2 task list
- `tiers.optional.items[*].title` — Optional task list

Read `seo-automation/outputs/project-cost.json`.
Extract: `summary.p1_total`, `summary.full_plan_total`, `summary.adjusted_budget`, `summary.over_budget`, `summary.overage_amount`, `human_summary`.

Read `seo-automation/outputs/product-owner-review.json`.
Extract: `enrichment_notes` (first 2 notes for display), `flagged_for_human_awareness` (count only).

Read `seo-automation/outputs/mql-check.json` if it exists.
Extract: `human_summary` (or use "MQL data not available" if missing).

**Step 2 — Build message strings**

- P1 list: join `tiers.priority_1.items[*].title` with newline prefix "• "
- P2 list: join `tiers.priority_2.items[*].title` with newline prefix "• "
- Optional list: join `tiers.optional.items[*].title` with newline prefix "• "
- Budget line:
  - If `over_budget` is false: "✅ Within budget — ₹[full_plan_total] of ₹[adjusted_budget] used"
  - If `over_budget` is true: "⚠️ Over budget by ₹[overage_amount] — P1-only cost is ₹[p1_total]"

**Step 3 — Send validation summary to Telegram**

```bash
openclaw message send \
  --channel telegram \
  --target -1003829892114 \
  --message "✅ SPRINT VALIDATED — <sprint_start> to <sprint_end>

🏆 Product Owner: Approved
📋 Sprint ID: <sprint_id>

✅ PRIORITY 1 TASKS:
<p1_list>

🔁 PRIORITY 2 TASKS:
<p2_list>

⚡ OPTIONAL:
<optional_list>

📊 MQL/SQL: <mql_human_summary>
💰 <budget_line>
💡 <human_summary from project-cost.json>

⚠️ Human awareness flags: <count of flagged_for_human_awareness> item(s) — check product-owner-review.json

Ready to proceed to task sheet? Use the button below."
```

Replace all `< >` placeholders with extracted values.

**Step 4 — Send proceed button**

```bash
openclaw message send \
  --channel telegram \
  --target -1003829892114 \
  --message "Proceed with task sheet for Sprint <sprint_id>?" \
  --buttons '[
    [
      {"text":"🚀 Proceed — populate task sheet","callback_data":"proceed|<sprint_id>"},
      {"text":"✏️ Adjust plan","callback_data":"adjust|<sprint_id>"}
    ]
  ]'
```

**CRITICAL**: `callback_data` values must be exactly:
- `proceed|<sprint_id>`
- `adjust|<sprint_id>`

The approval-bridge.js listener depends on this exact pattern.

**Step 5 — Write post-approval-status.json**

Create `seo-automation/outputs/post-approval-status.json`:

```json
{
  "sprint_id": "<sprint_id>",
  "status": "pending_proceed",
  "validated_at": "<ISO8601 now>",
  "po_verdict": "approved",
  "total_cost": "<summary.full_plan_total>",
  "budget": "<summary.adjusted_budget>",
  "over_budget": false,
  "proceed_clicked_at": null,
  "proceed_by": null
}
```

---

## Done Condition

1. Validation summary sent to Telegram (Step 3)
2. Proceed button message sent to Telegram (Step 4)
3. `post-approval-status.json` written with `status: "pending_proceed"` (Step 5)

If Telegram fails: write `post-approval-status.json` with `status: "telegram_failed"`.
