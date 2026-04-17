# HTML Preview Generator

## Purpose
Uses Puppeteer to render a branded HTML preview of the article that is exactly what will be published. The HTML file IS the publishing source — what the reviewer sees is what publishes. Saves to outputs and sends Telegram approval request.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

## Input
- seo-automation/outputs/edited-draft-[slug].md
- seo-automation/outputs/image-prompts-[slug].json
- seo-automation/outputs/content-brief-[slug].json

## Task

### Step 1 — Build HTML
Convert `edited-draft-[slug].md` to semantic HTML:
- Apply BiztechCS brand CSS (from website stylesheet — in MOCK: use inline CSS approximation)
- Embed images by filename (actual images saved alongside in PRODUCTION)
- Include: OG meta tags, canonical URL, schema.org Article JSON-LD markup
- Author byline section with structured data (Person schema)
- Internal links rendered as `<a href="/path">anchor text</a>`

### Step 2 — Schema validation
Check JSON-LD for:
- Article type correct
- Author name + URL present
- datePublished + dateModified fields present
- primaryImageOfPage set to hero image

### Step 3 — Render PDF preview (MOCK mode)
Run: `node seo-automation/generate-pdf.js [html_file] [output_pdf]`
Save: `seo-automation/outputs/preview-[slug].pdf`

### Step 4 — Mobile layout check
In PRODUCTION: Puppeteer viewport set to 375px. Screenshot saved alongside.
In MOCK: skip.

### Step 5 — Send Telegram approval
```
📄 Content Ready for Review: [Article Title]
Type: [Blog Post / Listicle]
Target keyword: [primary_keyword]
Author: [name]
Word count: [N]
AI Score: [X]% ✅   Keyword Tally: PASS ✅

🔗 HTML Preview: [file path]

Reply: APPROVE / REJECT / REVISE [instructions]
```

Include inline buttons: [✅ Approve] [❌ Reject] [🔄 Revise]

## OUTPUT DISCIPLINE — CRITICAL

- Use the write tool to save `preview-[slug].html` to disk.
- Do NOT print HTML contents to the screen.
- Do NOT summarize or explain after saving.
- Reply ONLY with: `✅ preview-[slug].html written`

## Output
- `seo-automation/outputs/preview-[slug].html`
- `seo-automation/outputs/preview-[slug].pdf`
- Content approval entry in `seo-automation/outputs/content-approval-[sprint_id].json`
