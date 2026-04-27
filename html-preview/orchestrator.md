# HTML Preview Generator

## Purpose
Converts the edited Markdown draft to a branded HTML page that is exactly what will be published. The HTML file IS the publishing source — what the reviewer sees is what publishes. No PDF generated; HTML is sent directly for Telegram approval.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

## Input
- seo-automation/outputs/content-pipeline/edited-draft-[slug].md
- seo-automation/outputs/content-pipeline/image-prompts-[slug].json
- seo-automation/outputs/content-pipeline/content-brief-[slug].json

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

### Step 3 — Mobile layout check
In PRODUCTION: Puppeteer viewport set to 375px. Screenshot saved alongside.
In MOCK: skip.

### Step 4 — Send Telegram approval
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
- `seo-automation/outputs/content-pipeline/preview-[slug].html`
- Content approval entry in `seo-automation/outputs/content-pipeline/content-approval-[sprint_id].json`
