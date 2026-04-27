# Validate Business Alignment

## Purpose
Checks each sprint plan attack vector against active products/services from the website scan and product owner config. Flags vectors that target non-existent, discontinued, or out-of-scope offerings.

## Model
claude-sonnet-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/seo-strategist/sprint-plan.json
- seo-automation/outputs/post-approval/website-scan.json
- seo-automation/product-owner/biztechcs-product-owner-config.md

## Task

For each attack vector in `sprint-plan.json`:

1. Match `focus_area` and `pages_or_keywords` against `active_offerings` from the website scan
2. Check if the targeted page/service exists on the live site
3. Verify the ICP aligns with configured ICP in product owner config
4. Check content items (blogs, listicles) — do they promote active services?

### Alignment rules
- PASS: target matches an active offering AND page exists or is planned
- FLAG: target is adjacent to an offering (note it, don't block)
- FAIL: target promotes a service not in active_offerings, or targets a discontinued page

### Output rules
- If any FAIL: `verdict: "misaligned"` with specific failure details
- If only FLAGs: `verdict: "aligned_with_notes"`
- If all PASS: `verdict: "aligned"`

## Output
- `seo-automation/outputs/post-approval/alignment-check.json`

Schema:
```json
{
  "sprint_id": "string",
  "verdict": "aligned | aligned_with_notes | misaligned",
  "vector_checks": [
    {
      "vector_number": 1,
      "focus_area": "string",
      "result": "pass | flag | fail",
      "note": "string"
    }
  ],
  "content_checks": [
    {
      "title": "string",
      "result": "pass | flag | fail",
      "note": "string"
    }
  ]
}
```
