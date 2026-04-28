# Social Media Engine

## Purpose
Triggered after Publishing Agent confirms publication. Aggregates industry news + our published content, generates a 14-day idea bank, gets Telegram idea approval, creates platform-native copy, gets individual post approval per piece, then schedules via SocialPilot API and queues manual posts (Reddit/Quora).

## Model
claude-opus-4-6

## Mode
MOCK

---

## IST Time Formatting Rule

When scheduling posts, ALL times must use IST (Indian Standard Time, UTC+05:30).

Format times as: `YYYY-MM-DDTHH:MM:SS+05:30`

Example: `2026-04-29T09:00:00+05:30`

**NEVER use `setHours()` or subtract hours/minutes from UTC.** Instead, directly construct the ISO string:
- Get the date (YYYY-MM-DD)
- Append the hour and minute directly as local IST values
- Always suffix with `+05:30`

**Platform time slots (IST):**
| Platform | Optimal Days | Time (IST) |
|----------|-------------|------------|
| LinkedIn | Tue, Wed, Thu | 08:00–10:00 |
| Twitter/X | Mon–Fri | 12:00–13:00 |
| Facebook | Mon–Fri | 18:00–20:00 |
| Instagram | Mon–Fri | 19:00–21:00 |

Space posts across the 14-day window. Do not schedule two posts for the same platform on the same day.

---

## SOUL OVERRIDE — CRITICAL

There are NO shell scripts. Do NOT look for `social-media-gen.sh`, `social-media-schedule.sh`, or any `.sh` file.
Do NOT look for scripts in any `scripts/` folder.
This orchestrator IS the full instruction set. Execute all steps below using the `write` tool to save outputs.
Do not ask questions. Do not stop mid-task.

---

## Input
- Published article URL + title + primary keyword (from Publishing Agent)
- seo-automation/outputs/intelligence-report/intelligence-report.md (for industry context)

## Task

### Step 1 — Aggregation (PRODUCTION: RSS + Agent-Browser)
Sources to pull:
- Search Engine Roundtable RSS
- Google Search Central blog RSS
- Moz Blog RSS
- Our published content this sprint

In MOCK mode: generate 8–10 fictional but realistic industry news items based on current SEO trends.

### Step 2 — Idea Bank Generation
For each content source and our published article, generate social media ideas.

Per idea:
- Platform (LinkedIn / Facebook / Instagram / Twitter-X / Reddit / Quora)
- Format (text post / carousel / thread / poll / long-form article)
- Angle (what specific insight or hook)
- Source (which article/event inspired it)
- Thought leadership hook (why BiztechCS has authority on this)
- Why it wins (what makes this specific to our audience)

Target: 15–20 numbered ideas.

### Step 3 — Telegram approval
Send idea bank summary to Telegram:
```
📱 Social Media Ideas — Sprint [sprint_id]
[N] ideas ready. Reply ✅ [n] to approve / ❌ [n] to skip.
[list first 5 ideas as one-liners]
```

In MOCK mode: do NOT wait for a reply. Treat all ideas as approved and proceed immediately to Step 4.

### Step 4 — Create approved posts
For each approved idea, write platform-native copy:
- LinkedIn: 150–300 words, no links in body, 3–5 hashtags, link in first comment
- Twitter/X: 5–7 tweet thread, each tweet ≤280 chars
- Facebook: 100–200 words, 1 link
- Instagram: caption 100–150 words, 25–30 hashtags (in first comment)
- Character limits are hard limits — cut content, never exceed

### Step 5 — Post Approval (Telegram)
For each created post, send an individual approval request:
```
📱 Post Ready for Approval
Platform: [LinkedIn|Twitter/X|Facebook|Instagram|Reddit|Quora]
Format: [text post|carousel|thread|poll|etc]
Proposed time: [Date] at [Time IST]

Copy preview:
[first 2 lines of post]...

Reply: APPROVE / REJECT / REVISE [instructions]
```

**In MOCK mode:** Do NOT wait for replies. Treat all posts as APPROVED and proceed
immediately to Step 6. Log each post with `"approval_status": "mock_approved"` in
the output JSON.

**In PRODUCTION mode:** Wait for each reply before scheduling. On REJECT: return to
Step 4 for that post. On REVISE [instructions]: apply targeted edits, re-send for
approval. On APPROVE: pass to Step 6 for scheduling.

### Step 6 — Scheduling

For each approved post, assign a scheduled_time in IST format: `YYYY-MM-DDTHH:MM:SS+05:30`

Use platform time slots from the IST Time Formatting Rule above.
Space posts across the 14-day window — no two posts for the same platform on the same day.
Use next-business-day dates starting from today.

- LinkedIn / Facebook / Instagram / Twitter-X posts: include `"scheduled_time": "[IST datetime]"` in the output JSON. In MOCK: SocialPilot API not called — mark `"scheduling": "mock_queued"`.
- Reddit/Quora posts: save to `seo-automation/outputs/social-media/social-manual-queue-[sprint_id].md`. Send Telegram:
  ```
  openclaw message send --channel telegram --target -1003829892114 --message "📋 [N] Reddit/Quora posts ready for manual posting. File: seo-automation/outputs/social-media/social-manual-queue-[sprint_id].md"
  ```

Cap: max 12 posts total this sprint. If current month's scheduled posts + new posts > 12, drop lowest-priority posts until under cap.

## OUTPUT DISCIPLINE — CRITICAL

- Use the write tool to save all output files to disk.
- Do NOT print file contents to the screen.
- Do NOT summarize or explain after saving.
- Reply ONLY with: `✅ social-posts-[sprint_id].json + social-manual-queue-[sprint_id].md written`

## Output

When writing `seo-automation/outputs/social-media/social-posts-[sprint_id].json`:
- Read the file if it exists.
- If it has an `articles` array: find the entry for `[slug]` and replace it (or append if not found).
- If it exists but has no `articles` array (old single-article format): wrap it as the first entry.
- If it does not exist: create fresh.
- Write structure: `{ "sprint_id": "[sprint_id]", "articles": [ { "slug": "[slug]", "title": "[title]", "published_url": "...", "generated_at": "...", "news_items": [...], "idea_bank": [...], "posts": [...] } ] }`

- `seo-automation/outputs/social-media/social-posts-[sprint_id].json`
- `seo-automation/outputs/social-media/social-manual-queue-[sprint_id].md`
