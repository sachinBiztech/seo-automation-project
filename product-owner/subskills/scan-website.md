# Scan Website

## Purpose
Scans the live BiztechCS website to extract active offerings, ICP signals, named authors, and content gaps. Used by Product Owner Agent to ground validation in current site reality.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

## Input
- seo-automation/product-owner/biztechcs-product-owner-config.md

## Task

Scan the following BiztechCS pages and extract structured data. In MOCK mode, use config file data only — do not make HTTP requests.

### Pages to scan (PRODUCTION only)
- /solutions/
- /case-studies/
- /blog/
- /docs/
- /testimonials/
- /about/

### Extract per page
1. Active products/services listed
2. Named authors (bio pages, author boxes)
3. ICP signals (industries mentioned, company sizes, pain points)
4. Content gaps (topics referenced but no dedicated page)
5. HTTP status (200 = live, else flag)

### Output rules
- Only include live pages (HTTP 200)
- Flag any page returning non-200 in `flagged_pages`
- In MOCK mode: populate from config file, set `scan_mode: "config_only"`

## Output
- `seo-automation/outputs/website-scan.json`

Schema:
```json
{
  "site": "BiztechCS",
  "scan_mode": "live | config_only",
  "scanned_at": "ISO8601",
  "active_offerings": ["string"],
  "named_authors": [{"name": "string", "title": "string", "bio_url": "string"}],
  "icp_signals": ["string"],
  "content_gaps": ["string"],
  "flagged_pages": [{"url": "string", "status": 0}]
}
```
