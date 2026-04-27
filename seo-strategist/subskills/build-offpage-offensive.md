# Subskill: build-offpage-offensive

## Purpose
Plan all off-page SEO activity for the sprint: backlink targets, guest posts,
digital PR, Quora answers, Reddit posts, LinkedIn long-form.

## Model
claude-opus-4-6

## Mode
MOCK

---

## Input

Read all of these files:

1. `seo-automation/outputs/seo-strategist/attack-vectors.json`
2. `seo-automation/outputs/intelligence-report/intelligence-brief-parsed.json`
3. `seo-automation/outputs/intelligence-report/competitor-findings.json`

---

## Role

You are the off-page SEO offensive planner for BiztechCS.

**Sprint off-page quotas for BiztechCS (hard limits):**
- Free backlinks (link building outreach): max 100 per sprint
- Paid backlinks: max 20 per sprint
- Quora answers: max 5 per sprint. Target: 4 this sprint.
- Reddit posts/comments: max 5 per sprint. Target: 3 this sprint.
- Guest posts: 1–2 per sprint
- Digital PR / data stories: max 1 per sprint
- LinkedIn long-form: 1–2 per sprint

---

## Task

**Step 1 — Backlink targets**
Identify 5–8 domains for outreach this sprint.
For each domain:
- Why it is a good link target (relevance, likely DA, topic alignment)
- Which of our pages it should link to (pick pages in the attack vectors)
- Outreach angle (what value we offer them — not just "we have content")

Priority targets: websites covering Odoo, ERP, manufacturing software, Salesforce alternatives.
Avoid: directories, link farms, irrelevant sites.

**Step 2 — Guest post targets**
Identify 1–2 websites that accept guest posts in our vertical.
For each:
- Target website
- Proposed article topic (must align with a content vector)
- Why this site is valuable (audience, likely DR/DA)
- Pitch angle

**Step 3 — Digital PR**
Identify 1 data story angle if applicable this sprint.
A data story requires a unique data point or original research we can offer to journalists.
If no strong data story angle exists from the current sprint data, write `null`.

**Step 4 — Quora answers (4 targets)**
Identify 4 Quora questions to answer this sprint.
For each:
- Question URL format: `https://www.quora.com/[question-slug]` (use descriptive slug)
- Why this question (traffic potential, competitor answers present, our expertise)
- Our angle (what unique insight do we add vs existing answers)
- Which of our pages to link to naturally within the answer

**Step 5 — Reddit posts (3 targets)**
Identify 3 subreddits and post angles.
For each:
- Subreddit (e.g., r/ERP, r/Odoo, r/smallbusiness)
- Post type: discussion / value-first answer / case study share
- Post angle (what we contribute — no self-promotion, value first)
- Link placement: in-post naturally or in comments

**Step 6 — LinkedIn long-form (1–2)**
Identify 1–2 LinkedIn article topics.
These should be thought leadership angles derived from our sprint content or research findings.
For each: topic, hook sentence, target audience, link back to our site.

---

## Output

Create the file `seo-automation/outputs/seo-strategist/offpage-plan.json` and write
the complete JSON below before finishing.

```json
{
  "site": "BiztechCS",
  "generated_at": "<today's date YYYY-MM-DD>",
  "quota_check": {
    "backlink_targets": 0,
    "backlink_max_free": 100,
    "backlink_max_paid": 20,
    "quora_planned": 0,
    "quora_max": 5,
    "reddit_planned": 0,
    "reddit_max": 5,
    "guest_posts_planned": 0,
    "digital_pr_planned": 0
  },
  "backlink_targets": [
    {
      "domain": "<target domain>",
      "relevance": "<why relevant>",
      "link_to_our_page": "<our page url>",
      "outreach_angle": "<what value we offer>",
      "type": "free|paid"
    }
  ],
  "guest_posts": [
    {
      "target_website": "<domain>",
      "proposed_topic": "<article topic>",
      "site_value": "<why this site matters>",
      "pitch_angle": "<how we pitch it>"
    }
  ],
  "digital_pr": null,
  "quora_answers": [
    {
      "question": "<question title>",
      "quora_url": "<url>",
      "our_angle": "<unique insight we add>",
      "link_to": "<our page url>"
    }
  ],
  "reddit_posts": [
    {
      "subreddit": "<r/subreddit>",
      "post_type": "discussion|value-answer|case-study",
      "post_angle": "<what we contribute>",
      "link_placement": "in-post|in-comments"
    }
  ],
  "linkedin_longform": [
    {
      "topic": "<article topic>",
      "hook": "<opening sentence>",
      "target_audience": "<who reads this>",
      "link_back": "<our page url>"
    }
  ]
}
```

Write this file completely before finishing.
