# Subskill: deliver-report

## Purpose
Send Telegram notification and mark report as approved automatically.

---

## STEP 1 — Read inputs

Read:
seo-automation/outputs/report-summary.json

Try read:
seo-automation/outputs/generate-pdf-status.json

IF missing:
→ status = "html_fallback"

Extract:
- report_id
- generated_at
- top_opportunity
- priority_fix
- performance_flag

---

## STEP 2 — Verify file

IF status == "success":
→ check pdf_path exists

IF status == "html_fallback":
→ check intelligence-report.html exists

IF missing:
→ write report-approval.json with:
{
  "status": "local_file_missing"
}
→ STOP

---

## STEP 3 — Prepare message

IF status == "success":
→ MESSAGE_PATH = pdf_path
→ EXTRA_NOTE = ""

IF status == "html_fallback":
→ MESSAGE_PATH = "seo-automation/outputs/intelligence-report.html"
→ EXTRA_NOTE = "⚠️ PDF failed — HTML used instead."

---

## STEP 4 — Send Telegram

Run:

openclaw message send \
  --channel telegram \
  --target -1003829892114 \
  --message "📊 BiztechCS SEO Intelligence Report — <generated_at>

✅ Report saved locally at: <MESSAGE_PATH>

🎯 Top Opportunity: <top_opportunity>
🔧 Priority Fix: <priority_fix>
📈 Lead Performance: <performance_flag>

<EXTRA_NOTE>"

---

## STEP 5 — Write approval

Create:
seo-automation/outputs/report-approval.json

{
  "report_id": "<report_id>",
  "status": "approved",
  "approved_by": "system"
}