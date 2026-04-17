# Keyword Research Analyst

## Purpose
Produces keyword universes for approved content topics. Sources: GSC existing rankings, Google Trends, AnswerThePublic. Seeded by Product Owner's validated service area map. Only researches approved topics.

## Model
claude-sonnet-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/enriched-sprint-plan.json
- seo-automation/outputs/gsc-findings.json
- seo-automation/product-owner/biztechcs-product-owner-config.md

## Task

For each content item in `enriched-sprint-plan.json.content_plan.items`:

1. **GSC seed keywords**
   - From `gsc-findings.json`, find queries where the target page already ranks (positions 4–20)
   - These are "capture" keywords — page is close to page 1

2. **Primary keyword expansion**
   - Take the `primary_keyword` from the content item
   - Generate semantic variants: long-tail, question-form, modifier-based
   - In MOCK mode: generate 10 keyword variants per primary keyword using LLM knowledge
   - In PRODUCTION mode: query Google Trends + AnswerThePublic via Agent-Browser

3. **Keyword scoring** (per keyword)
   - Estimated monthly search volume (low/medium/high in MOCK)
   - Keyword difficulty (low/medium/high in MOCK)
   - Intent: informational | commercial | transactional
   - Current BiztechCS position (from GSC, or "not ranking")

4. **Output per content item**
   - Primary keyword (confirmed)
   - 3–5 secondary keywords (supporting, same intent)
   - 2–3 long-tail variants (question-form for FAQ sections)
   - 1 semantic LSI term (for natural variation)

## Output
- `seo-automation/outputs/keyword-universe-[sprint_id].json`

Schema:
```json
{
  "sprint_id": "string",
  "generated_at": "ISO8601",
  "content_items": [
    {
      "title": "string",
      "primary_keyword": "string",
      "secondary_keywords": ["string"],
      "longtail_variants": ["string"],
      "lsi_terms": ["string"],
      "gsc_seeds": [{"keyword": "string", "current_position": 0}]
    }
  ]
}
```
