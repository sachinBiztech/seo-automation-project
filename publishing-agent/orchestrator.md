# Publishing Agent

## Purpose
Triggered after human APPROVE on content. Reads the HTML preview file and publishes it to the CMS — no reformatting. Archives to Drive /Approved/. Updates sprint sheet row to Done. Triggers Social Media Engine.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

## Input
- seo-automation/outputs/preview-[slug].html
- seo-automation/outputs/content-approval-[sprint_id].json
- seo-automation/outputs/content-brief-[slug].json

## Task

1. **Verify approval**
   - Read `content-approval-[sprint_id].json`
   - Find entry for `[slug]` with `status: "approved"`
   - If not approved: STOP. Do not publish.

2. **Publish to CMS** (PRODUCTION only)
   - BiztechCS runs on [CMS type from product owner config]
   - Send HTML content via CMS REST API
   - Set: title, slug, author, categories, tags, publish date
   - In MOCK mode: write a publish record to `outputs/publish-log-[sprint_id].json`

3. **Verify publication**
   - In PRODUCTION: HTTP GET the published URL, check HTTP 200 + title match
   - In MOCK: mark as `published_mock: true`

4. **Archive HTML**
   - Move `preview-[slug].html` to `outputs/approved/preview-[slug].html`

5. **Update sprint sheet**
   - Update task row in `sprint-tasks-[sprint_id].json`:
     - Status: `Published → Done`
     - Completed: [today's date]
     - Drive Link: published URL

6. **Trigger Social Media Engine**
   - Pass: published URL, article title, primary keyword, author, content type

7. **Telegram confirmation**
   - `✅ Published: "[Article Title]" → [URL]`

## OUTPUT DISCIPLINE — CRITICAL

- Use the write tool to save all output files to disk.
- Do NOT print file contents to the screen.
- Do NOT summarize or explain after saving.
- Reply ONLY with: `✅ [slug] published — publish-log-[sprint_id].json written`

## Output
- `seo-automation/outputs/publish-log-[sprint_id].json`
- Updates `seo-automation/outputs/sprint-tasks-[sprint_id].json`
