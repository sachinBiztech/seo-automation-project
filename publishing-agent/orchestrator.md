# Publishing Agent

## Purpose
Triggered after human APPROVE on content. Reads the HTML preview file and publishes it to the CMS — no reformatting. Archives to Drive /Approved/. Updates sprint sheet row to Done. Triggers Social Media Engine.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

## Input
- seo-automation/outputs/content-pipeline/preview-[slug].html
- seo-automation/outputs/content-pipeline/content-approval-[sprint_id].json
- seo-automation/outputs/content-pipeline/content-brief-[slug].json

## Task

### Step 1 — Verify approval

Read `seo-automation/outputs/content-pipeline/content-approval-[sprint_id].json`.

Find the entry where `slug == "[slug]"`. If not found: STOP. Send Telegram error.
If `status` is not `"approved"`: STOP. Do not publish. Send Telegram:
```
openclaw message send --channel telegram --target -1003829892114 --message "❌ Publishing blocked: [slug] status is [status] — not approved. Sprint: [sprint_id]"
```

Extract: `title`, `author`, `word_count`, `approved_at`, `task_id`.

### Step 2 — Load metadata

Read `seo-automation/outputs/content-pipeline/content-brief-[slug].json` if it exists.
Extract: `primary_keyword`, `eeaat_signals.author` (use as author if available).

Verify `seo-automation/outputs/content-pipeline/preview-[slug].html` exists.
If it does not exist: STOP. Send Telegram error.

Published URL: `https://www.biztechcs.com/blog/[slug]/`

### Step 3 — Publish to CMS (MOCK)

Read `seo-automation/outputs/publishing-agent/publish-log-[sprint_id].json` if it exists.
- If it exists and has a `published_articles` array: append this entry to the existing array.
- If it exists but is a plain object (old format): convert to `{ "sprint_id": "[sprint_id]", "published_articles": [existing_object, new_entry] }`.
- If it does not exist: create fresh with `{ "sprint_id": "[sprint_id]", "published_articles": [new_entry] }`.

The new entry to append:
```json
{
  "slug": "[slug]",
  "title": "[title]",
  "keyword": "[primary_keyword]",
  "author": "[author]",
  "word_count": [word_count],
  "published_url": "https://www.biztechcs.com/blog/[slug]/",
  "published_at": "[ISO8601 timestamp]",
  "published_mock": true,
  "cms": "BiztechCS WordPress (MOCK)",
  "status": "published",
  "html_source": "seo-automation/outputs/content-pipeline/preview-[slug].html"
}
```

Write the complete updated file back using the write tool.

### Step 4 — Archive HTML

Copy `seo-automation/outputs/content-pipeline/preview-[slug].html` content and write it to:
`seo-automation/outputs/publishing-agent/approved/preview-[slug].html`

### Step 5 — Update sprint task status

Read `seo-automation/outputs/sprint-pm/sprint-tasks-[sprint_id].json`.

CRITICAL — SURGICAL UPDATE ONLY:
1. The top-level array key may be `tasks` OR `items` — check which key exists and use it.
2. Find the ONE task where `title` contains "[slug]" OR `slug == "[slug]"` OR `sr == [task_id]`.
3. Update ONLY these three fields on that task object:
   - `status` → `"Done"`
   - `completed` → today's date (YYYY-MM-DD)
   - `driveLink` → `"https://www.biztechcs.com/blog/[slug]/"`
4. Do NOT change any other field. Do NOT restructure the JSON. Do NOT replace the array with content from any other file.
5. Write the COMPLETE original JSON back with ALL tasks preserved — only the one matching task's three fields are changed.

If the task is not found: log a warning but do not modify the file.

### Step 6 — Write social media trigger

Write `seo-automation/outputs/publishing-agent/social-media-trigger-[sprint_id].json`:
```json
{
  "sprint_id": "[sprint_id]",
  "slug": "[slug]",
  "title": "[title]",
  "primary_keyword": "[primary_keyword]",
  "author": "[author]",
  "published_url": "https://www.biztechcs.com/blog/[slug]/",
  "content_type": "blog",
  "published_at": "[ISO8601 timestamp]"
}
```

### Step 7 — Telegram confirmation

Send:
```
openclaw message send --channel telegram --target -1003829892114 --message "✅ Published: \"[title]\"

URL: https://www.biztechcs.com/blog/[slug]/
Author: [author] | Words: [word_count]
Sprint: [sprint_id]

Social media content generation starting now..."
```

## OUTPUT DISCIPLINE — CRITICAL

- Use the write tool to save all output files to disk.
- Do NOT print file contents to the screen.
- Do NOT summarize or explain after saving.
- Reply ONLY with: `✅ [slug] published — publish-log-[sprint_id].json written`

## Output
- `seo-automation/outputs/publishing-agent/publish-log-[sprint_id].json`
- Updates `seo-automation/outputs/sprint-pm/sprint-tasks-[sprint_id].json`
