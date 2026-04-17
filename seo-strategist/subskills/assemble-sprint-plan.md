# Subskill: assemble-sprint-plan

## Purpose
Combine content, technical, and off-page plans into the final sprint plan.
Produces sprint-plan.json (machine-readable handoff), sprint-plan.md
(human-readable summary), and sprint-plan.html (styled, used for PDF delivery).

## Model
claude-sonnet-4-6

## Mode
MOCK

---

## Input

Read all of these files:

1. `seo-automation/outputs/attack-vectors.json`
2. `seo-automation/outputs/intelligence-brief-parsed.json`
3. `seo-automation/outputs/content-plan.json`
4. `seo-automation/outputs/technical-plan.json`
5. `seo-automation/outputs/offpage-plan.json`

---

## Task

You are the sprint plan assembly agent for BiztechCS.

Read all 5 input files. Produce three output files.

---

### Output 1 — sprint-plan.json

Machine-readable handoff consumed by the Product Owner Review and Task Sheet Populator.

Create `seo-automation/outputs/sprint-plan.json`:

```json
{
  "sprint_id": "biztechcs_sprint_<YYYY-MM-DD>",
  "site": "BiztechCS",
  "mode": "mock",
  "generated_at": "<today's date YYYY-MM-DD>",
  "sprint_start": "<copy sprint_start from attack-vectors.json>",
  "sprint_end": "<copy sprint_end from attack-vectors.json>",
  "attack_vectors": "<copy vectors array from attack-vectors.json>",
  "content_plan": {
    "blogs_planned": 0,
    "listicles_planned": 0,
    "page_rewrites_planned": 0,
    "items": "<copy blog_posts + listicles + page_rewrites from content-plan.json>"
  },
  "technical_plan": {
    "cwv_fixes_planned": 0,
    "page_fixes_planned": 0,
    "structural_fixes_planned": 0,
    "items": "<copy cwv_fixes + page_fixes + structural_fixes from technical-plan.json>"
  },
  "offpage_plan": {
    "backlink_targets_count": 0,
    "guest_posts_count": 0,
    "quora_count": 0,
    "reddit_count": 0,
    "linkedin_count": 0,
    "items": "<copy all sections from offpage-plan.json>"
  },
  "total_deliverables": {
    "content": 0,
    "technical": 0,
    "offpage": 0,
    "total": 0
  },
  "mql_context": "<copy mql_context.context_note from intelligence-brief-parsed.json>",
  "top_opportunity": "<from attack-vectors vector 1 focus_area>",
  "priority_fix": "<from technical-plan cwv_fixes[0].fix or page_fixes[0].fix>"
}
```

Write this file completely before moving to Output 2.

---

### Output 2 — sprint-plan.md

Human-readable sprint plan for stakeholder review.

Create `seo-automation/outputs/sprint-plan.md`:

```
# BiztechCS SEO Sprint Plan — <YYYY-MM-DD> to <sprint_end>

## Sprint ID: <sprint_id>

## Attack Vectors
[One paragraph per vector: type, focus area, competitor context, expected outcome by Day 15]

## Content Plan (<N> pieces)
[Numbered list: title, primary keyword, target word count, author, vector alignment]

## Technical Fixes (<N> tasks)
[Numbered list: page/metric, diagnosis, fix, priority]

## Off-Page Plan (<N> actions)
[Backlink targets (list domains + outreach angle), Guest posts, Quora (list questions),
Reddit (list subreddits + angle), LinkedIn (list topics)]

## MQL Context
[Plain English explanation from mql_context]

## Total Deliverables
Content: N | Technical: N | Off-Page: N | Total: N
```

Write this file completely before moving to Output 3.

---

### Output 3 — sprint-plan.html

Styled HTML version used by the PDF generator and Telegram delivery.

Create `seo-automation/outputs/sprint-plan.html` using the structure below.
Populate every section with actual data. Replace all placeholders.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BiztechCS SEO Sprint Plan — <sprint_start> to <sprint_end></title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a2e; background: #fff; }
    .cover { background: #1a1a2e; color: #fff; padding: 60px 50px; min-height: 220px; }
    .cover h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .cover .subtitle { font-size: 14px; color: #a0aec0; }
    .cover .meta { font-size: 13px; color: #63b3ed; margin-top: 16px; }
    .section { padding: 32px 50px; border-bottom: 1px solid #e2e8f0; page-break-inside: avoid; }
    h2 { font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-left: 4px solid #3182ce; padding-left: 10px; }
    h3 { font-size: 13px; font-weight: 600; color: #2d3748; margin: 12px 0 6px; }
    p { line-height: 1.6; margin-bottom: 8px; }
    ul { padding-left: 20px; margin-bottom: 12px; }
    li { line-height: 1.7; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px; }
    th { background: #2d3748; color: #fff; padding: 8px 12px; text-align: left; font-weight: 600; }
    td { padding: 7px 12px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #f7fafc; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge-green { background: #c6f6d5; color: #276749; }
    .badge-red { background: #fed7d7; color: #9b2335; }
    .badge-yellow { background: #fefcbf; color: #744210; }
    .badge-blue { background: #bee3f8; color: #2b6cb0; }
    .task-card { background: #f7fafc; border-left: 3px solid #3182ce; padding: 10px 14px; margin-bottom: 8px; border-radius: 0 4px 4px 0; }
    .task-card .type { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #3182ce; margin-bottom: 4px; }
    .task-card .action { font-size: 12px; color: #4a5568; margin-top: 4px; }
    .vector-card { background: #ebf8ff; border: 1px solid #bee3f8; padding: 12px 16px; margin-bottom: 12px; border-radius: 4px; }
    .footer { background: #f7fafc; padding: 20px 50px; font-size: 11px; color: #718096; text-align: center; }
    .summary-box { display: inline-block; background: #2d3748; color: #fff; padding: 12px 20px; border-radius: 6px; margin: 4px; text-align: center; }
    .summary-box .num { font-size: 24px; font-weight: 700; }
    .summary-box .label { font-size: 11px; color: #a0aec0; }
  </style>
</head>
<body>

  <div class="cover">
    <h1>BiztechCS SEO Sprint Plan</h1>
    <div class="subtitle">15-Day Offensive Sprint — Automated by SEO Automation Engine</div>
    <div class="meta">
      Sprint: <sprint_start> → <sprint_end> &nbsp;|&nbsp; Sprint ID: <sprint_id>
    </div>
  </div>

  <div class="section">
    <h2>Sprint Summary</h2>
    <!-- 3 summary boxes: Total Content | Total Technical | Total Off-Page -->
    <!-- Use .summary-box divs with .num and .label -->
    <!-- Then one sentence on top opportunity and one on priority fix -->
  </div>

  <div class="section">
    <h2>Attack Vectors</h2>
    <!-- One .vector-card per vector: Vector #N badge, type badge, focus area, competitor context, expected outcome -->
  </div>

  <div class="section">
    <h2>Content Plan</h2>
    <!-- Table: Priority | Title | Primary Keyword | Word Count | Author | Vector -->
    <!-- Separate tables for Blog Posts, Listicles, Page Rewrites -->
  </div>

  <div class="section">
    <h2>Technical Fixes</h2>
    <!-- Table: Priority | Page/Metric | Issue | Fix | Impact -->
    <!-- Group: CWV Fixes, then Page Fixes, then Structural Fixes -->
  </div>

  <div class="section">
    <h2>Off-Page Plan</h2>
    <!-- Backlink Targets table: Domain | Relevance | Our Page | Outreach Angle | Type -->
    <!-- Quora/Reddit/LinkedIn as compact list items -->
  </div>

  <div class="section">
    <h2>MQL Context</h2>
    <!-- Plain English paragraph from mql_context — prevents Business Layer misreading -->
  </div>

  <div class="footer">
    BiztechCS &bull; SEO Automation Engine &bull; Confidential &bull; <generated_at>
  </div>

</body>
</html>
```

Populate every section with actual data from the input files.
Replace all placeholder comments with real content.

Write this file completely before finishing.
