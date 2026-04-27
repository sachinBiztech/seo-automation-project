# Enrich With Product Context

## Purpose
Adds product-specific proof points, case studies, features, and differentiators to each sprint plan content item. Ensures content briefs are grounded in real BiztechCS capabilities, not generic SEO angles.

## Model
claude-sonnet-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/seo-strategist/sprint-plan.json
- seo-automation/outputs/post-approval/website-scan.json
- seo-automation/product-owner/biztechcs-product-owner-config.md

## Task

For each content item in `sprint-plan.json.content_plan.items`:

1. Find matching product/service from `active_offerings` in website scan
2. Pull relevant case studies or proof points from product owner config
3. Identify the named author best suited for the topic (from `named_authors`)
4. Add a `differentiation_angle` — what BiztechCS can say that generic Odoo content cannot
5. Add `internal_linking_targets` — existing pages on site that should link to/from this piece

### Enrichment rules
- Every blog/listicle must have at least one proof point or case study reference
- Author assignment must match topic expertise area (from product owner config)
- Differentiation angle must be specific, not generic ("our 10 years of Odoo implementation" NOT "we are experts")

## Output
- `seo-automation/outputs/post-approval/enriched-sprint-plan.json`

Same schema as `sprint-plan.json` with each content item extended:
```json
{
  "proof_points": ["string"],
  "case_study_reference": "string | null",
  "assigned_author": {"name": "string", "title": "string"},
  "differentiation_angle": "string",
  "internal_linking_targets": ["string"]
}
```
