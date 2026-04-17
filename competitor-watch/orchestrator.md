# Competitor Watch

## Purpose
Always-on monitor. Daily checks for new competitor content and new backlinks. Weekly ranking movement checks. Instant Telegram alert on high-DA backlink acquisition by a competitor on core keywords. Feeds data to Intelligence Report's competitor section.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

## Input
- seo-automation/outputs/competitor-findings.json (previous run)
- seo-automation/product-owner/biztechcs-product-owner-config.md (competitor domain list)

## Task

### Daily checks

#### New competitor content
For each competitor domain in the config:
1. Check sitemap for new URLs added since yesterday (PRODUCTION: sitemap diff)
2. Check RSS feed for new posts (PRODUCTION: RSS pull)
3. In MOCK: generate 0–2 fictional new competitor pages per run

On new content detected:
- Log: domain, new URL, title, estimated topic
- If new content targets one of our primary keywords → flag as HIGH priority for SEO Strategist

#### New competitor backlinks
PRODUCTION: Ahrefs Webmaster API or free tier.
In MOCK: generate from `competitor-findings.json` mock data.

On high-DA backlink detected (DA > 50) on a core keyword:
- Instant Telegram: `🔗 Competitor Alert: [domain] acquired high-DA link from [linking-domain] (DA [N]) on keyword "[keyword]". Immediate attention recommended.`

### Weekly checks (every 7 days)

#### Ranking movements
For each competitor, track position changes on tracked keywords:
- Gained ≥5 positions on a tracked keyword → HIGH flag
- Lost ≥5 positions → note (opportunity)
- Entered top 3 on a keyword where we're 4–10 → URGENT flag

### Bot-blocking cascade (PRODUCTION)
If sitemap or RSS is blocked, cascade through:
1. Wayback CDX API
2. Google Cache
3. SimilarWeb
4. Ahrefs free
5. Google SERP `site:` query
6. LinkedIn/social profiles
7. Manual flag to human (Telegram: "⚠️ Cannot access [domain] — manual check needed")

## Output
- `seo-automation/outputs/competitor-findings.json` (updates daily, appends new entries)

## OUTPUT DISCIPLINE — CRITICAL

- Use the write tool to update `competitor-findings.json` on disk.
- Do NOT print file contents to the screen.
- Do NOT summarize or explain after saving.
- Reply ONLY with: `✅ competitor-findings.json updated — [N] new pages, [N] new backlinks`

Schema (new entry format):
```json
{
  "checked_at": "ISO8601",
  "new_content": [
    {"domain": "string", "url": "string", "title": "string", "keyword_overlap": "string | null", "priority": "high | normal"}
  ],
  "new_backlinks": [
    {"domain": "string", "linking_domain": "string", "da": 0, "keyword": "string", "alert_sent": true}
  ],
  "ranking_movements": [
    {"domain": "string", "keyword": "string", "position_before": 0, "position_after": 0, "delta": 0}
  ]
}
```
