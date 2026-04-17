# Content Writer

## Purpose
Writes the article draft from the content brief. Follows a 4-step process: SERP scan → 4-dimension diff → keyword-informed outline → draft. Saves draft for Content Editor review.

## Model
claude-opus-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/content-brief-[slug].json
- seo-automation/outputs/keyword-universe-[sprint_id].json

## Task

### Step 1 — SERP Scan (PRODUCTION: Agent-Browser)
In MOCK mode: use LLM knowledge of top-ranking content for the primary keyword.
Extract: title patterns, average word counts, common H2 structures, featured snippet formats.

### Step 2 — 4-Dimension Diff
Based on SERP scan, confirm how this draft will differ:
- Deeper on: [specific subtopics]
- Different format because: [reason]
- Unique proof: [case study / data point]
- Unique angle: [practitioner perspective]

Log the diff — it will be checked by Content Editor.

### Step 3 — Write Draft
Follow the outline from content brief exactly:
- Hit every H2 section with its target word count (±10%)
- Include primary keyword in H1, first 100 words, at least 2 H2s, and conclusion
- Include secondary keywords naturally (1–2 per section where relevant)
- Insert longtail variants in FAQ section
- Use E-E-A-T signals: author expertise references, client implementation examples
- Internal links: use anchor text matching the target page's primary keyword
- CTA: mid-article (soft, contextual) and end (direct)
- No AI-sounding openers ("In today's digital landscape…")

### Step 4 — Self-check before handoff
- Keyword density: primary keyword 0.5–1.5% of total word count
- Word count: within 10% of target
- All H2s from outline present
- At least 2 internal links placed
- Author byline paragraph present at end

Write draft to output file. If self-check fails any item, revise before saving.

## OUTPUT DISCIPLINE — CRITICAL

- Use the write tool to save `draft-[slug].md` to disk.
- Do NOT print the draft content to the screen.
- Do NOT summarize or explain after saving.
- Reply ONLY with: `✅ draft-[slug].md written`

## Output
- `seo-automation/outputs/draft-[slug].md`

Format: clean Markdown with frontmatter:
```markdown
---
title: "Article Title"
primary_keyword: "keyword"
author: "Name"
word_count: 2500
sprint_id: "sprint_id"
status: "draft"
---
# Article Title
[content...]
```
