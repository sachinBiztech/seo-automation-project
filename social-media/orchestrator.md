# Social Media Engine

## Purpose
Triggered after Publishing Agent confirms publication. Aggregates industry news + our published content, generates a 14-day idea bank, gets Telegram approval, creates platform-native copy, schedules via SocialPilot API, and queues manual posts (Reddit/Quora).

## Model
claude-opus-4-6

## Mode
MOCK

## Input
- Published article URL + title + primary keyword (from Publishing Agent)
- seo-automation/outputs/intelligence-report.md (for industry context)

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
Post full idea bank to Telegram group:
```
📱 Social Media Ideas — Sprint [sprint_id]
[N] ideas ready for approval.

1. [Platform] | [Format]: [one-line angle]
2. ...

Reply: ✅ [n] to approve | ❌ [n] to reject | 🔄 [n] [revised angle]
```

### Step 4 — Create approved posts
For each approved idea, write platform-native copy:
- LinkedIn: 150–300 words, no links in body, 3–5 hashtags, link in first comment
- Twitter/X: 5–7 tweet thread, each tweet ≤280 chars
- Facebook: 100–200 words, 1 link
- Instagram: caption 100–150 words, 25–30 hashtags (in first comment)
- Character limits are hard limits — cut content, never exceed

### Step 5 — Post scheduling
- Approved posts for LinkedIn/Facebook/Instagram/Twitter: schedule via SocialPilot API
- Reddit/Quora: save to manual queue, Telegram alert: `📋 [N] Reddit/Quora posts ready. Queue: [file path]`
- Optimal times: LinkedIn (Tue–Thu 8–10 AM IST), Instagram (evenings 7–9 PM IST)

### Cap enforcement
Max 12 posts/month per website. Count current month's scheduled posts before scheduling.

## OUTPUT DISCIPLINE — CRITICAL

- Use the write tool to save all output files to disk.
- Do NOT print file contents to the screen.
- Do NOT summarize or explain after saving.
- Reply ONLY with: `✅ social-posts-[sprint_id].json + social-manual-queue-[sprint_id].md written`

## Output
- `seo-automation/outputs/social-posts-[sprint_id].json`
- `seo-automation/outputs/social-manual-queue-[sprint_id].md`
