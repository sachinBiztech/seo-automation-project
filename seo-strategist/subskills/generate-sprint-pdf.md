# Subskill: generate-sprint-pdf

## Purpose
Convert sprint-plan.html to a PDF using system Chrome (puppeteer-core).
Write generate-sprint-pdf-status.json with the result.
If PDF generation fails, fall back to HTML — pipeline continues.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

---

## Input

Read: `seo-automation/outputs/sprint-plan.html`
Read: `seo-automation/outputs/sprint-plan.json`

---

## Task

You are the PDF generation agent for BiztechCS Sprint Plans.

**Step 1 — Read inputs**
Read `seo-automation/outputs/sprint-plan.json`.
Extract: `sprint_id`, `site`.

Confirm `sprint-plan.html` exists and is non-empty:
```bash
test -s "/home/sachin.p/.openclaw/workspace/seo-automation/outputs/sprint-plan.html" && echo "OK" || echo "MISSING"
```
If MISSING: write `generate-sprint-pdf-status.json` with `status: "html_fallback"` and `error: "sprint-plan.html not found"`. Stop.

**Step 2 — Generate PDF via puppeteer-core**

Run a Node.js script using puppeteer-core and system Chrome.
IMPORTANT: Run the node command from inside the seo-automation project directory so node_modules resolves correctly.

The PDF filename uses **today's actual date** (the date the pipeline is running), NOT the sprint start date.
This ensures each pipeline run produces a distinctly-named fresh PDF.

```bash
cd /home/sachin.p/.openclaw/workspace/seo-automation && node -e "
const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const htmlPath = path.resolve('outputs/sprint-plan.html');

  // Use TODAY's date for the filename so each run creates a new file
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
  const pdfFilename = 'BiztechCS-SEO-Sprint-Plan_' + today + '.pdf';
  const pdfPath = path.resolve('outputs/' + pdfFilename);

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
  console.log('TODAY=' + today);
})().catch(err => { console.error('PDF_ERROR=' + err.message); process.exit(1); });
"
```

**Step 3 — Write generate-sprint-pdf-status.json**

Parse the output lines from the Node.js script:
- `PDF_PATH=...` → the full path to the PDF
- `PDF_FILENAME=...` → just the filename
- `TODAY=...` → today's date string (e.g. `2026_04_16`)

If PDF generation succeeded (exit code 0, PDF_PATH present):

```json
{
  "site": "BiztechCS",
  "sprint_id": "<sprint_id>",
  "generated_at": "<TODAY value>",
  "status": "success",
  "pdf_filename": "<PDF_FILENAME value>",
  "pdf_path": "<PDF_PATH value>",
  "fallback_html_path": null,
  "error": null
}
```

If PDF generation failed (non-zero exit or PDF_ERROR present):

```json
{
  "site": "BiztechCS",
  "sprint_id": "<sprint_id>",
  "generated_at": "<TODAY value — use date +%Y_%m_%d if TODAY not set>",
  "status": "html_fallback",
  "pdf_filename": null,
  "pdf_path": null,
  "fallback_html_path": "seo-automation/outputs/sprint-plan.html",
  "error": "<error message>"
}
```

Write to: `seo-automation/outputs/generate-sprint-pdf-status.json`

---

## Done Condition

This subskill is complete when `generate-sprint-pdf-status.json` is written.
- On success: `status: "success"` with valid `pdf_path`
- On failure: `status: "html_fallback"` — pipeline continues, does NOT stop
