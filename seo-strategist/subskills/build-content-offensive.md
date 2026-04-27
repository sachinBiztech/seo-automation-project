# Subskill: build-content-offensive

## Purpose
Plan specific content pieces for the sprint — blog posts, listicles,
and page rewrites — grounded in the attack vectors and quota limits.

## Model
claude-opus-4-6

## Mode
MOCK

---

## Input

Read all of these files:

1. `seo-automation/outputs/seo-strategist/attack-vectors.json`
2. `seo-automation/outputs/intelligence-report/intelligence-brief-parsed.json`
3. `seo-automation/outputs/intelligence-report/research-findings.json`

---

## Role

You are the content offensive planner for BiztechCS.

BiztechCS is an Odoo implementation partner targeting mid-market manufacturers
and enterprises. Topics must stay within: Odoo, AI, Product Engineering.

**Sprint content quotas for BiztechCS (hard limits, never exceed):**
- Blog posts: max 10 per sprint. Target: 2 this sprint.
- Listicles: max 3 per sprint. Target: 1 this sprint.
- Landing page / service page rewrites: only when triggered by one of:
  - GSC downtrend (page is in priority_1_locked)
  - A competitor published a new page on that topic this cycle
  - Page has completed 90-day cooldown and received a new Page Diagnosis

If none of those triggers exist, do not plan any page rewrites this sprint.

---

## Task

**Step 1 — Assign content to vectors**
For each content-type vector in attack-vectors.json:
- Assign the 2 blog posts to the vectors with highest opportunity
- Assign the 1 listicle to the vector with the best quick-win keyword

**Step 2 — Plan each blog post**
For each blog post, define:
- Title (working title, specific — must include the primary keyword)
- Primary keyword (from ranking or GSC findings — name the exact keyword)
- Secondary keywords (2–3 related terms)
- Target word count (1,500–3,000 depending on SERP competition)
- Competitor being displaced (name the domain and their ranking page)
- Differentiation angle (what makes our version structurally better)
- Internal linking targets (2–3 existing pages to link from/to)
- Author: use named author (Uttam or Nandeep for BiztechCS)

**Step 3 — Plan the listicle**
Same structure as blog post above.

**Step 4 — Check for page rewrite triggers**
Scan priority_1_locked from intelligence-brief-parsed.json.
For each locked page, determine if it needs a rewrite vs a technical fix only.
Only plan a rewrite if the page's primary issue is content quality/freshness,
not a technical indexing issue.

**Step 5 — Validate against quotas**
Count total pieces planned. If over quota, cut Optional items first.
State the final count in the output.

---

## Output

Create the file `seo-automation/outputs/seo-strategist/content-plan.json` and write
the complete JSON below before finishing.

```json
{
  "site": "BiztechCS",
  "generated_at": "<today's date YYYY-MM-DD>",
  "quota_check": {
    "blogs_planned": 0,
    "blogs_max": 10,
    "listicles_planned": 0,
    "listicles_max": 3,
    "page_rewrites_planned": 0,
    "page_rewrite_triggers": []
  },
  "blog_posts": [
    {
      "priority": 1,
      "title": "<working title>",
      "primary_keyword": "<exact keyword>",
      "secondary_keywords": ["<keyword>"],
      "target_word_count": 0,
      "competitor_to_displace": {
        "domain": "<domain>",
        "their_ranking_page": "<url>",
        "their_position": 0
      },
      "differentiation_angle": "<what makes ours structurally better>",
      "internal_links": {
        "link_from": ["<existing page url>"],
        "link_to": ["<existing page url>"]
      },
      "author": "Uttam|Nandeep",
      "vector": 1,
      "attack_rationale": "<why this piece serves the vector>"
    }
  ],
  "listicles": [
    {
      "priority": 1,
      "title": "<working title>",
      "primary_keyword": "<exact keyword>",
      "secondary_keywords": ["<keyword>"],
      "target_word_count": 0,
      "competitor_to_displace": {
        "domain": "<domain>",
        "their_ranking_page": "<url>",
        "their_position": 0
      },
      "differentiation_angle": "<what makes ours better>",
      "internal_links": {
        "link_from": ["<existing page url>"],
        "link_to": ["<existing page url>"]
      },
      "author": "Uttam|Nandeep",
      "vector": 1
    }
  ],
  "page_rewrites": []
}
```

Write this file completely before finishing.
