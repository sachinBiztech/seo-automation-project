# Subskill: deliver-report

## Purpose
Send Telegram notification and mark report as approved automatically.

---

## STEP 1 — Read inputs

Read:
seo-automation/outputs/intelligence-report/report-summary.json

Try read:
seo-automation/outputs/intelligence-report/generate-pdf-status.json

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
→ MESSAGE_PATH = "seo-automation/outputs/intelligence-report/intelligence-report.html"
→ EXTRA_NOTE = "⚠️ PDF failed — HTML used instead."

---

## STEP 4 — Write Telegram payload

Write the file `seo-automation/outputs/intelligence-report/telegram-payload.json` with the message the runner will send:

```json
{
  "channel": "telegram",
  "target": "-1003829892114",
  "message": "📊 BiztechCS SEO Intelligence Report — <generated_at>\n\n✅ Report saved locally at: <MESSAGE_PATH>\n\n🎯 Top Opportunity: <top_opportunity>\n🔧 Priority Fix: <priority_fix>\n📈 Lead Performance: <performance_flag>\n\n<EXTRA_NOTE>"
}
```

Replace all `<placeholders>` with the actual values. For `<EXTRA_NOTE>` use an empty string `""` if status is `success`.

---

## STEP 5 — Write approval

Create:
seo-automation/outputs/intelligence-report/report-approval.json

{
  "report_id": "<report_id>",
  "status": "approved",
  "approved_by": "system"
}