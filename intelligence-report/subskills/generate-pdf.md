# Subskill: generate-pdf

## Purpose
Convert intelligence-report.html to a PDF using system Chrome (puppeteer-core).
Write generate-pdf-status.json with the result.
If PDF generation fails, fall back to HTML — do NOT stop the pipeline.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

---

## Input

Read: `seo-automation/outputs/intelligence-report/intelligence-report.html`
Read: `seo-automation/outputs/intelligence-report/report-summary.json`

---

## Task

You are the PDF generation agent for BiztechCS Intelligence Reports.

**Step 1 — Read inputs**
Read `seo-automation/outputs/intelligence-report/report-summary.json`.
Extract: `report_id`, `generated_at`, `site`.

Confirm `intelligence-report.html` exists and is non-empty:
```bash
test -s "/home/sachin.p/.openclaw/workspace/seo-automation/outputs/intelligence-report/intelligence-report.html" && echo "OK" || echo "MISSING"
```
If MISSING: write `generate-pdf-status.json` with `status: "html_fallback"` and `error: "intelligence-report.html not found"`. Stop.

**Step 2 — Remove any existing PDF with the same name before generating**

Delete any stale PDF that would conflict with today's filename, so we always produce a fresh file:

```bash
rm -f /home/sachin.p/.openclaw/workspace/seo-automation/outputs/intelligence-report/<site>-SEO-Intelligence-Report_<generated_at_underscored>.pdf
```

Replace `<site>` and `<generated_at_underscored>` with the actual values before running.

**Step 3 — Generate PDF via puppeteer-core**

Run a Node.js script using puppeteer-core and system Chrome.
IMPORTANT: Run the node command from inside the seo-automation project directory so node_modules resolves correctly.

```bash
cd /home/sachin.p/.openclaw/workspace/seo-automation && node -e "
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  const htmlPath = path.resolve('outputs/intelligence-report/intelligence-report.html');
  const pdfFilename = '<site>-SEO-Intelligence-Report_<generated_at_underscored>.pdf';
  const pdfPath = path.resolve('outputs/intelligence-report/' + pdfFilename);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    headless: true
  });

  const page = await browser.newPage();
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  await browser.close();

  console.log('PDF_PATH=' + pdfPath);
  console.log('PDF_FILENAME=' + pdfFilename);
})().catch(err => { console.error('PDF_ERROR=' + err.message); process.exit(1); });
"
```

Replace `<site>` with the site name (e.g. `BiztechCS`).
Replace `<generated_at_underscored>` with `generated_at` using underscores instead of hyphens (e.g. `2026_04_27`).

**Step 4 — Verify PDF was actually created**

```bash
test -s "/home/sachin.p/.openclaw/workspace/seo-automation/outputs/intelligence-report/<site>-SEO-Intelligence-Report_<generated_at_underscored>.pdf" && echo "PDF_OK" || echo "PDF_MISSING"
```

If output is `PDF_MISSING`: set status to `html_fallback` and continue.

**Step 5 — Write generate-pdf-status.json**

If PDF generation succeeded (exit code 0, PDF_PATH present):

```json
{
  "site": "<site>",
  "generated_at": "<generated_at>",
  "status": "success",
  "pdf_filename": "<pdf_filename>",
  "pdf_path": "<pdf_path>",
  "fallback_html_path": null,
  "error": null
}
```

If PDF generation failed (non-zero exit or PDF_ERROR present):

```json
{
  "site": "<site>",
  "generated_at": "<generated_at>",
  "status": "html_fallback",
  "pdf_filename": null,
  "pdf_path": null,
  "fallback_html_path": "seo-automation/outputs/intelligence-report/intelligence-report.html",
  "error": "<error message>"
}
```

Write to: `seo-automation/outputs/intelligence-report/generate-pdf-status.json`

---

## Done Condition

This subskill is complete when `generate-pdf-status.json` is written.
- On success: `status: "success"` with valid `pdf_path`
- On failure: `status: "html_fallback"` — pipeline continues, does NOT stop
