# Concept from Parth — SEO Automation Engine
**Version:** 3.0 | **Date:** March 2026
**Property:** [website] — site-agnostic framework, instantiated independently per website. The SME / Product Owner layer is configured per site and is the only layer that varies between deployments.
**Runtime:** Mac Mini (always-on) | **Framework:** OpenClaw | **Approvals:** Telegram only

---

## 1. Project Vision

A fully autonomous, human-gated SEO operation engine that runs on a biweekly Saturday intelligence cycle, produces an offensive sprint strategy for the next 10 working days (Monday–Friday), executes through specialized agents, and distributes approved content through a multi-stage approval chain — with every action logged to Google Drive and tracked in Google Sheets.

**Core principle:** The system does not respond to competitors. It attacks. Every sprint plan is framed as: *"What structural advantage can we create in 15 days?"*

**What already exists (do not rebuild):**
- Named authors + E-E-A-T infrastructure — already in place on [website] (verify at instantiation per site)
- Content generation + humanization agents — existing pipeline handles this
- Ranking check flow — client's in-built system feeds ranking data into the Intelligence Report

---

## 2. System Architecture — Full Flow

```
═══════════════════════════════════════════════════════════════
                    BI-MONTHLY TRIGGER
              (launchd cron: 1st + 16th of month)
═══════════════════════════════════════════════════════════════
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│              INTELLIGENCE REPORT ENGINE                   │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  GA4 +  │ │  Odoo   │ │Competitor│ │  20 Research │  │
│  │  GSC    │ │ CRM Data│ │  Watch   │ │  Questions   │  │
│  │  API    │ │(XML-RPC)│ │          │ │  (Opus)      │  │
│  └────┬────┘ └────┬────┘ └────┬─────┘ └──────┬───────┘  │
│       └───────────┴───────────┴──────────────┘           │
│                            │                              │
│                    PDF Report Generated                   │
│           [SiteName]-SEO-Intelligence-Report_YYYY_MM-DD  │
└────────────────────────────┬─────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         Drive Save    Odoo Email      Telegram Alert
       /Intelligence/  to Stakeholders  "Report ready"
         Reports/
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│               SPRINT STRATEGY ENGINE                      │
│                                                          │
│  SEO Strategist Agent reads Intelligence Report          │
│  Produces: 15-day offensive sprint plan                  │
│      → 3 Attack Vectors                                  │
│      → Content Offensive (exact articles + angles)       │
│      → Off-Page Offensive (specific targets)             │
│      → Technical Wins                                    │
│      → Social Amplification                              │
│      → AI Overview targets                               │
│      → Metrics to move                                   │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│             SME / PRODUCT OWNER REVIEW                    │
│                                                          │
│  Validates: business alignment, product scope,           │
│  competitor claims, messaging guardrails                 │
│                                                          │
│  PASS → forward to Business Layer                        │
│  FAIL → revision inputs → back to SEO Strategist         │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│           BUSINESS LAYER APPROVAL (Telegram)              │
│                                                          │
│  ✅ POC sends GO (task selections confirmed)              │
│     → Task Sheet auto-populated in Google Sheets         │
│     → Sprint PM Layer runs (10-day daily schedule)       │
│     → Sheet shared with team                             │
│                                                          │
│  ❌ No GO received                                        │
│     → Reminder at 24h → Escalate to fallback POC at 48h  │
│     (Sprint never auto-executes without human GO)        │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│           SPRINT PROJECT MANAGEMENT LAYER                 │
│                                                          │
│  10 working days (Mon–Fri × 2 weeks)                     │
│  Tasks distributed by: priority + type sequence +        │
│  dependencies + parallel capacity                        │
│                                                          │
│  Daily 9AM cron → trigger agents for today's tasks       │
│  Daily 6PM cron → rollover check + dependency alerts     │
└────────────────────────────┬─────────────────────────────┘
                             │
               ┌─────────────┼─────────────────────┐
               ▼             ▼                       ▼
    ┌─────────────┐  ┌──────────────┐    ┌──────────────────┐
    │ TECHNICAL   │  │  CONTENT     │    │   OFF-PAGE SEO   │
    │ SEO AGENT   │  │  PIPELINE    │    │   ORCHESTRATOR   │
    └──────┬──────┘  └──────┬───────┘    └────────┬─────────┘
           │                │                      │
           ▼                ▼                      ▼
    Schema, crawl    Content Writer          Backlink outreach
    budget, CWV,     ↓                       Guest post briefs
    redirects        Content Editor          GitHub answers (API)
                     (humanize + gate)       Reddit drafts → Drive
                     ↓                       Quora drafts → Drive
                     Graphics Designer       ↓
                     ↓                  Outreach Manager
                     HTML Preview       (Odoo Email Module)
                     → Drive
                     ↓
               Telegram: Drive link
               APPROVE / REJECT / REVISE
                     ↓ APPROVE
               Publishing Agent
               (reads HTML from Drive,
                publishes exactly as reviewed)
                             │
                             ▼
═══════════════════════════════════════════════════════════════
                      SOCIAL MEDIA ENGINE
═══════════════════════════════════════════════════════════════
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        Industry news   Our published   Idea Bank
        aggregator      content         (14 days)
              └──────────────┴──────────────┘
                             │
                    Telegram: Idea Approval
                    ✅ per idea / ❌ skip / 🔄 revise
                             │
                             ▼
                    Approved ideas → post creation
                    Platform-native copy + image brief
                             │
                    Graphics Designer → asset
                             │
                    Telegram: Post Approval
                    ✅ APPROVE / ❌ REJECT / 📝 REVISE
                             │
              ┌──────────────┴───────────────┐
              ▼                              ▼
     SocialPilot API               Manual Queue (Drive)
   (FB, IG, LinkedIn,              Reddit + Quora posts
    Twitter/X)                     → Telegram alert to human
    Schedule + log                   → Human posts manually

═══════════════════════════════════════════════════════════════
         GOOGLE DRIVE LOGS + GOOGLE SHEETS TRACKER
              (auto-updated throughout all stages)
═══════════════════════════════════════════════════════════════
```

---

## 3. Agent System — 5-Layer Design

### Layer 1 — Analysis (runs biweekly Saturday + on-demand)

**Agent: SEO Performance Analyzer**
- Pulls GA4 + GSC data via API
- Ingests ranking data from client's in-built ranking flow
- Compares current rankings/traffic/conversions against monthly and annual goals
- Identifies: gaps, wins, declining content, missed keyword opportunities
- Output: structured performance brief → passed to Strategy layer

**Agent: Competitive Intelligence**
- Tracks competitor ranking changes (via SERP monitoring), new content, backlink acquisitions
- Flags when a competitor moves significantly on target keywords
- Runs continuously; feeds both Strategy and Audit layers

### Layer 2 — Strategy (runs after Analysis output is ready)

**Agent: SEO Strategist**
- Reads performance brief + competitive intelligence
- Proposes: keyword priorities, content gaps to address, technical fixes, digital PR angles
- Does NOT execute — produces strategy proposal document
- Hands to Product Owner for review

**Agent: Product Owner**
- Reviews SEO Strategist's proposal against: current product/service priorities, active sales pipeline, what the business wants to rank for this quarter
- Can reject, reprioritize, or reshape any recommendation
- Holds the ICP definition and service area map
- Output: approved or revised strategy with business rationale

**Agent: Business Model Reviewer**
- Validates approved strategy against: US market positioning, revenue model, margin priorities, client segment
- Sanity check question: "Does ranking for this keyword actually bring in the work we want?"
- Can be merged with Product Owner if overlap is too high

> **Human checkpoint — Telegram.** Strategy approved by both agents posted to Telegram for Business Layer human approval before execution begins.

### Layer 3 — Continuous Watch (always-on)

**Agent: Algorithm Intelligence** *(Barry Schwartz methodology)*
- Monitors Google updates and SERP volatility daily
- Sources: Search Engine Roundtable, MozCast pattern monitoring via Agent-Browser
- Pushes rapid-response playbook to SEO Strategist when significant movement detected

**Agent: Best Practices Monitor**
- Tracks: structured data updates, new SERP features, E-E-A-T guidance changes
- Monthly digest to SEO Strategist so strategy stays current
- Sources: all 12 named pundits — Neil Patel, Brian Dean, Barry Schwartz, Rand Fishkin, Lily Ray, Kevin Indig, Marie Haynes, Aleyda Solis, John Mueller, Cyrus Shepard, Patrick Stox, Ross Hudgens. Publications: Search Engine Journal, Search Engine Land, Moz Blog, Ahrefs Blog, NP Digital Blog, Backlinko, Google blog

**Agent: Competitor Watch**
- Daily: new competitor content on target topics (RSS diff)
- Weekly: competitor ranking movements, new backlinks (Ahrefs Webmaster)
- Instant Telegram alert: competitor earns a high-DA backlink on our core keywords

### Layer 4 — Execution (triggered after Business Layer approval)

**Agent: Technical SEO Specialist**
- Works from validated priority list only — not a generic audit
- Knows which pages matter to the business, not just which have issues
- Actions: schema markup fixes, crawl budget optimization, Core Web Vitals improvements, redirect chain cleanup

**Agent: Keyword Research Analyst**
- Seeded by Product Owner's validated service area map
- Produces keyword universes for approved topics only
- Sources: GSC existing rankings, Google Trends via Agent-Browser, AnswerThePublic via Agent-Browser

**Agent: Content Strategist**
- Builds content briefs from validated keywords
- Hands briefs to Content Writer agent
- Receives approved drafts back, passes to Audit layer

**Agent: Digital PR & AI Search Optimizer**
- Consolidated: link building + GEO/AI Overview optimization
- Runs Skyscraper audits and journalist pitches on approved content only
- Tracks LLM visibility (ChatGPT, Perplexity, AI Overviews) for target queries

### Layer 5 — Audit (post-execution, before anything publishes)

**Agent: SEO Expert Reviewer**
- Validates: title tags, meta descriptions, internal linking, schema markup, keyword placement
- Checks against current best practices (informed by Best Practices Monitor)
- Hard gate — nothing publishes without this pass

**Agent: Content Auditor**
- Reviews finalized content for: quality signals, E-E-A-T compliance, factual accuracy flags, CTA integration
- Periodically audits existing published content for decay/refresh opportunities

---

## 4. Module: Bi-Monthly Intelligence Report

### Trigger
macOS launchd fires **biweekly on Saturday** — aligned to the sprint cycle end. The full Intelligence → Strategy → Product Owner → Business Layer pipeline runs over the weekend. POC reviews Saturday evening and gives GO by Sunday. Sprint begins Monday — clean start, no gap.

**Two Mac Minis — website assignment:**
- **Machine 1:** BiztechCS + AppJetty (shared POC)
- **Machine 2:** PrintXpand + CRMJetty (shared POC)

```xml
<!-- ~/Library/LaunchAgents/seo.intelligence.plist -->
<key>StartCalendarInterval</key>
<array>
  <dict><key>Day</key><integer>1</integer><key>Hour</key><integer>6</integer><key>Minute</key><integer>0</integer></dict>
  <dict><key>Day</key><integer>16</integer><key>Hour</key><integer>6</integer><key>Minute</key><integer>0</integer></dict>
</array>
```

### Data Sources

> **Performance lookback principle:** SEO is a long-cycle discipline. A single 15-day window is too noisy to assess trend direction — rankings fluctuate daily, traffic has weekly patterns, and the impact of any action takes weeks to stabilise. All performance data (rankings, traffic, CTR, impressions, lead flow) is pulled and assessed across three windows: **15-day delta** (what changed this cycle — used for new activity signals only), **90-day trend** (primary assessment window — 6 sprint cycles, meaningful directional signal), and **180-day baseline** (contextual trend, seasonality context, long-term direction). New activity monitoring (competitor new pages, algorithm update confirmations) continues on the 15-day cycle window only.

| Source | Metrics Pulled | Access Method |
|--------|---------------|---------------|
| Google Analytics 4 | Sessions, users, bounce rate, conversions, traffic by source, organic share — bot and spam traffic excluded at source (property-level bot filtering + 0-second session filter). **Organic traffic assessed across 3 windows: 15-day delta, 90-day trend, 180-day baseline.** | **BigQuery** — GA4 native export to BigQuery (Google Cloud). All raw event data lands daily. Intelligence Report queries via SQL — no GA4 Data API calls, no quota risk. Per-website BigQuery dataset. |
| Google Search Console | Rankings, impressions, CTR, crawl coverage, index status, Core Web Vitals — **all segmented by region** (not individual countries). Performance assessed across **90-day and 180-day windows**. 15-day delta as immediate momentum signal only. | **BigQuery** — GSC native export to BigQuery (Google Cloud). 180-day lookback = `WHERE date >= DATE_SUB(CURRENT_DATE, INTERVAL 180 DAY)` — no rate limit risk. Per-website BigQuery dataset. |
| In-built Ranking Flow | Top 50 keyword positions, MoM change, QoQ change | Client's existing system — output format TBD with client |
| Microsoft Clarity | Heatmap summary, rage click pages, dead click pages, scroll depth averages | Clarity REST API v0 — API key. Note: Clarity API is limited; supplement with dashboard CSV export if needed |
| Odoo XML-RPC | Leads, MQLs, SQLs by date range, lead source, deal value; **built-in landing page reports** mapping leads/MQLs/SQLs to originating landing page (12-month minimum lookback) | `{ODOO_URL}/xmlrpc/2/object` — `crm.lead` model |
| Competitor Monitoring | New pages, new blog posts, content updates, new backlinks | Sitemap XML diff + RSS diff + Wayback CDX API + Ahrefs Webmaster |
| **Competitor Keyword Position Table** | Our position vs. each named competitor's position for every tracked keyword — updated every cycle. Includes: position delta since last cycle, featured snippet ownership, AI Overview citation status. **Long-term view: cumulative table, never reset. Full history retained. Active strategy layer reads last 6 months rolling — prevents table bloat from degrading performance after 12+ cycles.** Used as mandatory pre-strategy input every sprint. | SerpAPI / Agent-Browser SERP scrape per keyword |
| Algorithm Signals | Google update confirmations, SERP volatility score | Search Engine Roundtable (Agent-Browser scrape) + MozCast public API |
| Industry Best Practices | Latest SEO guidance, E-E-A-T updates, new SERP features, link-building tactics | Agent-Browser monitors the following named pundits and publications every cycle: **Barry Schwartz** (Search Engine Roundtable — algorithm updates, Google changes), **Lily Ray** (Amsive Digital — E-E-A-T, core updates, content quality), **Kevin Indig** (Growth Memo — AI search, GEO, strategy frameworks), **Marie Haynes** (Marie Haynes Consulting — Google quality signals, helpful content), **Aleyda Solis** (Orainti — technical SEO, international SEO), **John Mueller** (Google Search Relations — official Google guidance), **Cyrus Shepard** (Zyppy — on-page SEO, internal linking), **Patrick Stox** (Ahrefs — technical SEO, crawling, indexing), **Rand Fishkin** (SparkToro — zero-click, audience intelligence), **Ross Hudgens** (Siege Media — content-driven link building), **Neil Patel** (NP Digital — conversion-focused content marketing, keyword universe building, backlink acquisition at scale), **Brian Dean** (Backlinko — data-driven SEO, Skyscraper Technique, content-first link building). Sources: personal blogs, LinkedIn posts, X/Twitter, Search Engine Journal, Search Engine Land, Moz Blog, Ahrefs Blog, NP Digital Blog, Backlinko. |

**GSC Regional Segmentation — detail:**
All ranking and traffic data is segmented by region, not individual countries. Four primary regions reported separately:
- **North America** — US, CA (+ other North American markets)
- **Europe** — GB and EU markets
- **Middle East & Africa** — AE, SA, QA and broader ME/Africa countries
- **Australia & New Zealand** — AU, NZ

All other countries grouped as `Rest of World`. Region composition is configured at instantiation per each website's actual target markets. This surfaces whether a ranking win or drop is regional or global in nature.

**GSC Organic Landing Page Performance — detail:**
The focus is not generic rank movers — it is the **top 20 organic landing pages that are known to generate leads**. **Source: Odoo CRM built-in landing page reports — minimum 12-month lookback window** (or full available history if longer). Odoo natively maps leads, MQLs, and SQLs to landing pages — no GA4 cross-reference required. This list is re-queried from Odoo each cycle to reflect current reality. For each of these 20 pages, the report tracks performance across the current vs. prior 15-day window:

Per page data points:
- Average GSC position: 90-day trend + 180-day baseline + 15-day delta (delta = immediate signal only)
- Total impressions: 90-day trend + 180-day baseline
- CTR: 90-day trend + 180-day baseline
- Odoo lead contribution: current cycle + 90-day cumulative (Leads → MQLs → SQLs)

**Trend classification (based on 90-day window — not cycle delta):**
- **Uptrending** — position improving over 90 days + impressions growing → attack candidates for the sprint (push further)
- **Downtrending** — position declining over 90 days OR impressions dropping → defend/fix candidates (arrest decline before lead flow is affected)
- **Volatile** — cycle-to-cycle swings with no clear 90-day direction → watch list, not actioned until trend clarifies

This keeps the Intelligence Report anchored to business outcomes — not vanity ranking movements on pages that don't convert.

**GSC Insights — detail:**
GSC Insights is a separate surface from the Performance report. It proactively surfaces pages Google has flagged as significantly changing in momentum — content gaining traction and content losing traction — based on Google's own signals, not just raw position data. This is pulled independently and treated with higher urgency than the Performance data.

- **Source:** GSC Insights tab — accessed via Agent-Browser since GSC Insights does not have a dedicated API endpoint separate from the standard Search Analytics API
- **Pull:** Every cycle, the agent reads the Insights panel and extracts all pages flagged as downtrending or gaining traction

**GSC Insights downtrending pages — priority elevation rule:**
If GSC Insights flags any pages as downtrending, those pages are automatically assigned **Priority 1** in both the Sprint Strategy and the Google Sheet task tracker. They are not treated as standard sprint tasks — they sit at the top of the task list and are the first items the SEO Strategist incorporates into the sprint plan, before any attack vectors are defined. The logic: Google is already signalling momentum loss — the longer the delay, the harder the recovery.

1. Agent extracts the downtrending page list from GSC Insights
2. For each downtrending page: pulls current position, impressions, CTR, last-modified date, page type (blog/service/landing)
3. Passes these pages to the SEO Strategist as **locked Priority 1 inputs** — the strategist must address each one in the sprint plan before building out offensive actions
4. In the Google Sheet task tracker, these rows are created first, flagged `Priority: HIGH`, and assigned before any other task is populated
5. Uptrending pages from Insights are logged in the Intelligence Report as amplification opportunities — candidates for the sprint's content offensive or social calendar

**Previous Sprint Fix Verification:**
Any page that had a fix applied during the previous sprint is automatically carried into the current Intelligence Report as a tracked item. The agent reads the previous sprint's Google Sheet task tracker, extracts all rows where Task Type = fix/technical and Status = Done, then checks the current GSC + Insights data for each of those pages.

For each previously fixed page, the report shows:

| Page | Fix Applied | Fix Date | Cooldown Expires | Position Before | Position Now | Impressions Before | Impressions Now | CTR Before | CTR Now | Verdict |
|------|------------|----------|-----------------|----------------|-------------|-------------------|-----------------|-----------|---------|---------|

**Verdict values:**
- ✅ **Recovered** — position improved, impressions growing, GSC Insights no longer flags it as downtrending
- ⏳ **In Progress** — some improvement but not yet fully recovered. Carry forward as a watch item.
- ❌ **Not Recovered** — no measurable improvement or still downtrending in Insights. Page is flagged for re-evaluation — but only actioned after the cooldown window has passed (see below).

This closes the feedback loop: every fix gets verified in the next cycle, and anything that didn't work is flagged — but never touched again until the cooldown window clears.

---

**Page Cooldown Window:**
Once a fix is applied to any page, that page enters a **cooldown window of 90 days (6 sprint cycles)**. This is not an arbitrary buffer — it reflects the actual timeline of how Google processes changes:

- **Days 1–14:** Google discovers the change and begins re-crawling the page
- **Days 15–45:** Rankings begin shifting but remain volatile — not a reliable signal, any verdict drawn here is premature
- **Days 45–75:** Stabilisation window — the new ranking baseline starts forming based on Google's updated evaluation
- **Days 75–90:** Clean post-fix data accumulates — enough signal to make a meaningful, evidence-based verdict

During the 90-day cooldown window:

- The page is marked `Status: Cooldown` in the Google Sheet tracker with the cooldown expiry date logged
- The page cannot receive any new fix tasks, content edits, or structural changes — it is locked from modification for the full 90 days
- The Intelligence Report monitors it passively every cycle: position, impressions, CTR, and GSC Insights status are tracked and logged, but no action is triggered
- If GSC Insights flags the page as downtrending during its cooldown window, it is noted under a dedicated **"In Cooldown — Watch List"** section in the report — not the Priority 1 fix queue. The strategist is aware but the page cannot be touched until the window clears.
- 30-day windows were insufficient — they capture the volatile phase and mistake early noise for a verdict. 90 days ensures the data reflects Google's stabilised re-evaluation, not mid-flight turbulence.

**Post-Cooldown Fix — handed to the Page Diagnosis Agent:**
When a page's cooldown window expires and it still requires a fix, it is not passed back to the SEO Strategist directly. It is routed to a dedicated **Page Diagnosis Agent** (see Section 10 — Agent Interaction Map) which compiles the full evidence brief and produces the fix recommendation before the strategist sees it. The strategist receives a diagnosis, not a task.

### Data Quality Gate

Before the Intelligence Report is released to the Strategy Layer, a data completeness check runs against every source. If any critical source returns empty, partial, or suspect data, the report is flagged — not silently passed through.

| Source | Failure condition | Flag type |
|--------|------------------|-----------|
| GA4 API | Returns 0 sessions or errors on pull | 🔴 CRITICAL — report released with gap noted; strategy layer informed |
| GSC API | Returns 0 impressions for tracked URLs | 🔴 CRITICAL — same as above |
| Odoo XML-RPC | Connection failure or 0 leads returned | 🔴 CRITICAL — MQL/SQL section marked incomplete |
| Ranking flow | No position data returned | 🔴 CRITICAL — competitor table and rankings section flagged |
| Clarity API | No session data | 🟡 WARNING — section omitted, report continues |
| Competitor scrape | All 8 fallback methods return insufficient data | 🟡 WARNING — competitor flagged as "blocked — last known state: [date]" |
| Algorithm signals | MozCast unavailable + Search Engine Roundtable unreachable | 🟡 WARNING — algorithm section marked "no new data this cycle" |

**Rules:**
- 🔴 CRITICAL flags: Intelligence Report is released but every section affected by the gap is explicitly marked `⚠️ DATA INCOMPLETE — [source] failed this cycle`. Strategy Layer and Business Layer both receive this flag as context.
- 🟡 WARNING flags: section is omitted or marked with a note; report continues normally.
- No silent failures. The system never passes incomplete data as if it were complete.

**Source Attribution Coverage Check (runs as part of Odoo data pull):**
Attribution is captured automatically via a custom cookie on the websites — Odoo receives source data directly and classifies leads as Organic, Outbound, and other relevant business sources. No UTM setup required. Before the top 20 landing pages list is finalised, the agent checks what percentage of leads have a source classification populated. If coverage < 80%, the landing page section is flagged: `⚠️ Source attribution coverage [X]% — landing page attribution may be incomplete. Leads without source tracking excluded from ranking.` Strategy Layer is informed. The data is still used — but the gap is visible, not hidden.

### Lead Flow Metrics (from Odoo)

Pulled for three windows — MTD, QTD, YTD:

| Metric | Definition in Odoo |
|--------|--------------------|
| Total Leads | `crm.lead` records where `type = 'lead'` created in window |
| MQLs | Read from Odoo native MQL field on `crm.lead` — no custom filter needed |
| SQLs | Leads that have reached the SQL stage |
| MQL → SQL conversion rate | SQLs / MQLs × 100 |
| Lead source breakdown | `source_id` field on `crm.lead` — Organic, Paid, Referral, Direct, Social |
| Organic lead share % | Organic leads / Total leads × 100 |
| Velocity: Lead → MQL (avg days) | `date_conversion` - `create_date` at MQL stage |
| Velocity: MQL → SQL (avg days) | Date at SQL stage - date at MQL stage |
| Pipeline value from organic | Sum of `expected_revenue` where source = Organic |

### Rankings & SEO Performance

> All ranking and traffic metrics use 90-day and 180-day windows as primary assessment. The 15-day cycle delta is a supplementary signal — not the basis for strategic decisions.

From in-built ranking flow + GSC API:
- **Top 50 tracked keywords:** position now vs 90 days ago vs 180 days ago. 15-day cycle delta shown as supplementary column only.
- **Trend classification per keyword:** Climbing (improving over 90 days) / Holding / Declining / Volatile (no clear 90-day direction)
- **New keywords entering top 20:** not ranked top 20 at the 90-day mark, are now
- **Keywords that dropped out of top 20:** were in top 20 at the 90-day mark, no longer
- **CTR per keyword cluster:** 90-day average vs 180-day average — is CTR structurally improving or deteriorating?
- **Organic traffic trend:** 90-day organic sessions vs prior 90 days vs 180-day baseline (GA4)
- **Core Web Vitals snapshot:** LCP, INP, CLS — from PageSpeed Insights API
- **Index coverage:** new pages indexed vs pages lost from index this cycle (GSC API)
- **AI Overview presence:** which target queries now show AI Overview, are we cited?

### Competitor Watch

**Competitors monitored:** *(competitor domain list provided per website at instantiation)*

| Signal | Frequency | Method |
|--------|-----------|--------|
| New pages published | Every cycle | Download current sitemap XML, diff against previous cycle's saved copy. New URLs = new pages. |
| New blog posts | Every cycle | RSS feed diff. If no RSS, blog sitemap section diff. |
| Content updates on existing pages | Every cycle | Wayback Machine CDX API: query for URLs captured since last cycle. Hash page content at last crawl; if changed, flag. |
| New backlinks earned | Every cycle | Ahrefs Webmaster Tools API (own domain) or Agent-Browser scrape of Ahrefs public data for competitor domains |
| New partnerships / PR mentions | Every cycle | Google Alerts digest via Odoo email monitoring + brand mention scan via Agent-Browser |
| Social media innovations | Every cycle | LinkedIn public profile page scrape + Twitter/X public timeline scrape via Agent-Browser |
| Technical changes (schema, CWV) | Monthly | PageSpeed API diff + Schema.org validator against cached previous result |
| Job postings (strategic intent) | Monthly | LinkedIn Jobs scrape for competitor company names via Agent-Browser |

**Competitor Bot-Blocking Fail-Safe (cascade, in order):**

When a competitor's site blocks the Anthropic-AI user-agent:

1. **Wayback Machine CDX API** — `https://web.archive.org/cdx/search/cdx?url={domain}/*&output=json&from={last_cycle_date}&to={today}` — returns all URLs captured. Never blocked. Free.
2. **Google Cache** — `https://webcache.googleusercontent.com/search?q=cache:{url}` — Google's cached copy, different user-agent
3. **RSS / Atom feeds** — Most CMS platforms expose feeds regardless of bot blocking. Try `{domain}/feed`, `{domain}/rss`, `{domain}/blog/feed`
4. **SimilarWeb public data** — Traffic estimates, top pages, traffic sources via Agent-Browser on SimilarWeb's public URL
5. **Ahrefs free tier** — Organic keywords, top pages, domain rating without crawling the target site
6. **Google SERP `site:` query** — `site:{competitor.com}` via Agent-Browser returns all indexed pages with titles and descriptions
7. **LinkedIn + social profiles** — Product updates, announcements, job posts. Social platforms never block SEO bots because they're not the target.
8. **Manual flag** — If all methods return insufficient data, the report flags: `⚠️ {Competitor} — bot blocked. Last known state: {date}. Manual review required.`

### 20 Research Questions (tiered by compute — every cycle)

These run as part of the Intelligence Report pipeline. Each question produces a condensed finding + specific action recommendation. Tiered to reduce cost and runtime without sacrificing synthesis quality.

**Tier A — Data aggregation (Sonnet):** Q4, Q7, Q8, Q9. Collect and summarise reported facts. Fast model sufficient.

**Tier B — Strategic synthesis (Opus):** Q1, Q2, Q3, Q5, Q6, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Q17, Q18, Q19, Q20. Cross-source reasoning, pattern recognition, strategic recommendation. Opus only.

**Category A — Search Landscape Intelligence**
1. What new SERP features has Google launched or tested in the past 15 days that affect informational and commercial queries in our industry? How should our content and schema adapt?
2. Which types of content are currently winning AI Overviews for our top 20 target queries? What structural, topical, or authority characteristics do the cited sources share that we can replicate?
3. What does the latest SERP volatility data reveal about which query types are most unstable right now — and what does this imply for where we double down versus hold? What is Rand Fishkin's current read on zero-click search trends, and what audience intelligence signals from SparkToro data should inform whether we prioritize branded versus non-branded traffic this sprint?
4. What has Search Engine Roundtable / Barry Schwartz reported in the past 15 days regarding confirmed or probable algorithm changes? What's the current consensus on recovery paths for affected site types?
5. What are the top 5 structured data / schema markup opportunities Google has recently added support for or begun featuring more prominently in SERPs — and which of our pages should implement them first?

**Category B — Competitor Intelligence**
6. Based on competitor content published in the past 15 days, what topics or angles are they aggressively investing in? Are they targeting our core keywords directly, or flanking us on adjacent terms?
7. Which of our competitors earned the most new backlinks this cycle? From what domain types (media, directory, guest post, niche site)? What content or campaign earned those links — and can we reverse-engineer it?
8. What new pages did competitors add to their site in the past 15 days? Are any directly targeting keywords we currently rank for, or approaching topics from an angle we have not yet covered?
9. Are there signals in competitor job postings, press releases, or LinkedIn updates indicating a major strategic shift — new market, new product, new content vertical — that we should preempt in the coming sprint?
10. **[Long-term strategic view — tracked every cycle, not just this sprint]** For our full target keyword universe, what is the current position of each named competitor vs. our own ranking? Which competitors gained positions since last cycle, and on which specific keywords? Which have slipped? Where are the largest deltas — either where a competitor has overtaken us (recovery targets) or where we are within 3–5 positions of overtaking them (attack targets)? What is the featured snippet and AI Overview citation status per keyword? **This question generates the Competitor Keyword Position Table — a cumulative, cycle-over-cycle record that is a standing input to every sprint strategy. Sprint Attack Vectors must always be cross-referenced against this table.**

**Category C — Content & E-E-A-T Intelligence**
11. What are leading SEO researchers (Neil Patel, Lily Ray, Kevin Indig, Marie Haynes) saying this month about content quality signals, E-E-A-T criteria changes, or helpfulness evaluation? What content depth, format, and conversion-path patterns is Neil Patel's team currently seeing drive organic wins for B2B service businesses — and do any of those patterns apply directly to our top 20 lead pages? What immediate changes should we make?
12. Which content formats are currently outperforming long-form articles in our industry SERPs — and is this a structural SERP shift or a temporary test? (videos, tools, data studies, Reddit/Quora results, listicles)
13. What does current best practice recommend for internal linking strategy given how Google's PageRank distribution has evolved? Which patterns (hub-and-spoke, reverse silo, flat hierarchy) are winning in 2026?
14. What does the latest research say about optimal content freshness signals — how frequently should pages be updated, and what update types (stat refresh, new section, structural rewrite) carry the most weight?
15. What are the top 3 content angles in our industry that no one is covering adequately — identified by analysing PAA boxes, Reddit threads, Quora questions, and forums with high engagement but no strong organic answer?

**Category D — Technical & Off-Page Intelligence**
16. What does current data say about Core Web Vitals thresholds — INP specifically — and how much ranking weight Google is applying to page experience signals? Are there threshold changes to respond to now?
17. What link-building tactics are leading practitioners (Brian Dean, Aleyda Solis, Patrick Stox) currently recommending? Which of Brian Dean's Skyscraper Technique variants or data-led content formats are currently earning the highest natural backlink rates in B2B service industries? Which outreach formats (HARO/Connectively, digital PR, resource links, guest posts) are showing the highest success rates right now?
18. What is the current state of Google's treatment of Reddit, Quora, and forum content in SERPs? What does this mean for our off-page strategy in terms of platform investment?
19. What does the latest research reveal about Google's handling of duplicate content, thin content, and consolidation opportunities? Are there specific page types where consolidation is now clearly better than expansion?
20. What innovative SEO or content experiments have been published in the past 15 days by practitioners or tools that could give us a competitive edge if adopted early? (Structured data experiments, prompt engineering for AI Overviews, programmatic SEO approaches, new link-earning tactics)

### PDF Report

**Filename:** `[SiteName]-SEO-Intelligence-Report_[YYYY]_[MM-DD].pdf`
*(Static name, variable date. Example: `[SiteName]-SEO-Intelligence-Report_2026_03-16.pdf`)*

**Sections:**
1. Cover — Logo | Report title | Date | Property | Prepared by SEO Automation Engine
2. Executive Summary — 1 page max, key numbers only (no narrative)
3. Lead Flow Dashboard — MTD / QTD / YTD tables for Leads, MQLs, SQLs + funnel conversion rates
4. Rankings & Traffic Snapshot — top movers, top drops, CTR changes, Core Web Vitals
5. Algorithm Update Status — confirmed updates, volatility score, pages impacted
6. Competitor Watch — findings this cycle, flags for urgent attention
7. Best Practices & Recommendations — 20 questions condensed to findings + action items
8. Appendix — raw data tables

**Generation:** Puppeteer (Node.js) renders a branded HTML template to PDF.
**Drive save:** `/SEO Automation Engine/Intelligence Reports/[YYYY]/[filename].pdf`
**Delivery:** Odoo Marketing/Email module sends to stakeholder distribution list.
**Telegram alert:** Bot posts to `TELEGRAM_GROUP_ID`: `📊 Intelligence Report ready — [date]. Check Drive or email.`

**Performance context field (passed to Business Layer):**
In addition to the PDF, the Intelligence Report generates a structured JSON summary for machine consumption. This JSON includes a `performance_context` field — a plain-language explanation of any MQL/SQL variance from the per-sprint target. Example: `"MQL target: 12, Actuals: 7. Likely cause: Google Helpful Content Update confirmed this cycle (see Algorithm section) — organic traffic to top 3 lead pages dropped 18%. Not a strategy failure — algorithmic event."` The Business Layer reads this field before running its MQL/SQL performance check, so underperformance caused by external events is not misread as strategic failure.

---

## 5. Module: Sprint Strategy Engine

### Trigger
Fires automatically after Intelligence Report PDF is saved to Drive and delivery is confirmed.

### Strategy Generation

SEO Strategist agent reads the Intelligence Report output (structured JSON summary, not full PDF) and produces a 15-day sprint plan.

**Frame enforced in every sprint:** *"What structural advantage can we create in 15 days?"* — not "what problems do we fix?"

The sprint strategy is **history-backed and expert-informed**. Every tactic must be traceable to either (a) a finding from this cycle's 20 research questions, or (b) a verified outcome from a previous sprint. Generic strategies ("publish blog posts, build links") are rejected at SME review.

**Mandatory pre-strategy input — Competitor Keyword Position Table:**
Before any attack vectors are selected, the SEO Strategist reads the current Competitor Keyword Position Table (generated by Q10 in the Intelligence Report). This is a **long-term strategic view** — a cumulative table maintained every cycle showing our position vs. each competitor's position across all tracked keywords. It is never reset. Competitors who have gained 5+ positions on a target keyword since last cycle are automatically flagged as Attack Vector candidates. Keywords where we are within 3–5 positions of overtaking a competitor are attack window signals. This table is the primary lens through which Attack Vectors are selected — not just SERP opportunity, but competitive momentum.

**Sprint plan sections (all required):**

---

**Section 1 — Sprint Period**
Exact dates (e.g., 2026-04-01 to 2026-04-15)

---

**Section 2 — Top 3 Attack Vectors**
Each attack vector is a specific SERP opportunity — not a theme. Per vector:
- Target keyword cluster (primary keyword + 3–5 related terms)
- Current position and gap to top 5
- Competitor holding that position and their weakest signal (thin content? low-DA backlinks? poor E-E-A-T?)
- **Why now** — the intelligence trigger: which research question finding or GSC Insights signal makes this the right 15-day window to attack

---

**Section 3 — Content Offensive**
Broken into content types. Every entry is a fully specified brief. All content pieces follow the **CS/PX 7-step article creation pipeline** (SERP scan → 4-dimension diff → keyword-informed outline → draft → humanize → score gate → HTML preview + publish).

**3a. Blog Posts — target: 2 per sprint**
Per post:
- Title
- Primary keyword + search volume
- Secondary keywords (3–5)
- Target word count (2,000–3,500 words)
- Intended SERP position by end of sprint
- Competitor being targeted (their URL + current position)
- Differentiation angle — what makes this article structurally better (content gap, depth, data, format)
- Expert technique applied (e.g., "Brian Dean Skyscraper — add original data section to beat [competitor]"; "Neil Patel conversion-path structure — CTA embedded at 40% scroll depth")
- Internal linking targets (3–5 existing [website] pages this post links to)
- **Article creation pipeline:**
  1. SERP scan — top 10 results: structure, word count, headings, what's missing
  2. 4-dimension diff check — what competitors cover / what we cover / neither covers (gap) / we cover better (angle)
  3. Keyword-informed outline — H1, H2s, H3s built around target + secondary keywords
  4. Draft — written against outline; embed stats, expert citations, case study references
  5. Humanize — `/humanize` skill: ZeroGPT patterns removed, em dashes replaced, cross-source synthesis, 2–4 Pro tips embedded
  6. Score gate — AI% **< 8%** AND keyword tally **PASS** (both mandatory before advancing)
  7. HTML mockup — styled render, uploaded to Drive, sent for Discord/Telegram approval
  8. Publish — CMS upload, images uploaded (per-article subfolder, `[site-slug]-blog-[slug]-[section].png`), schema injected, internal links verified

**3b. Listicles — target: 1 per sprint**
Per listicle:
- Title (numbered format — "X Ways to...", "X Signs That...")
- Primary keyword + search volume
- Target word count (1,500–2,500 words)
- Intended SERP position
- Items competitors' versions are missing (minimum 3 differentiated items)
- Expert technique applied
- Same 7-step pipeline as blog posts

**3c. Website Content — Service/Landing Page Rewrites (as triggered)**
Only triggered by: GSC downtrending flag, competitor new page on same keyword, or post-cooldown Page Diagnosis Agent brief.
Per page:
- URL
- Trigger reason
- Specific sections to rewrite
- Target keyword + current → target position
- E-E-A-T improvement required (author bio? case study addition? stat refresh?)
- Score gate: AI% < 10% for service pages

---

**Section 4 — Off-Page Offensive**
Not "build backlinks." Every entry is a named target with a fully drafted outreach plan.

**4a. Backlink Target List — target: 5–8 domains per sprint**
Per target domain:

| Field | Required |
|-------|---------|
| Target domain | e.g., clutch.co |
| Target URL | Specific page where our link should appear |
| Domain Authority (DA) | e.g., DA 72 |
| Contact method | Email / contact form / LinkedIn |
| Contact person | Name + LinkedIn URL if known |
| Outreach pitch draft | 3–4 sentences — why linking to us benefits their readers. Ready to send. |
| Backlink type | Earned (editorial) / Guest post / Resource page / Directory |
| **Paid backlink flag** | Yes / No / Unknown — if site is known to monetize links, note it and estimate cost |
| **Existing backlink check** | Do we already have a link from this domain? If Yes: URL + date acquired + can it be refreshed or upgraded to a higher-value page on their site? |
| Priority | 1 (highest) / 2 / 3 |
| Historical note | Any prior outreach to this domain — accepted, rejected, ignored? |

**4b. Guest Post Targets — target: 1–2 per sprint**
Guest posts are NOT a generic strategy. Each is a named site with a specific editorial fit.
Per site:
- Site name + URL + DA
- Specific section/category on their site where the post fits
- Proposed article title + angle (must match their editorial focus — research their recent posts first)
- Why their audience benefits from this topic
- Contact person + email / submission form URL
- **Paid/sponsored flag** — if the site charges for guest posts, note this + estimated cost
- Prior relationship — have we published there before? If yes, leverage the contact
- Full outreach pitch (ready to send — personalized, references their recent content)
- Content: 1,200–2,000 words, same 7-step pipeline, AI% < 8%

**4c. Digital PR — target: 1 original data story per sprint maximum**
- Story angle (must use original data — client data, survey, or curated public source compilation)
- Newsworthiness hook
- Target publications (3–5 named outlets + contact name + submission details)
- Full pitch draft (ready to send)
- Link strategy: natural backlink earning (Brian Dean Skyscraper model) or active pitch campaign?

**4d. Quora — target: 4 answers per sprint**
Per answer:
- Question URL
- Why this question — search volume estimate + is a Quora result ranking on page 1 for this query?
- Answer angle — what we say that existing top answers don't
- Internal link target (one link per answer, contextually placed)

**4e. Reddit — target: 3 posts/comments per sprint**
Per entry:
- Subreddit + thread URL (or "new post" with proposed title)
- Value angle — what insight we're contributing, not what we're promoting
- Internal link: Yes/No (link only where naturally useful to the reader)

**4f. LinkedIn Long-Form Articles — target: 1–2 per sprint (separate from social posts)**
Per article:
- Topic + angle
- Target keyword (LinkedIn search = secondary traffic source)
- Cross-link to the corresponding published [website] blog post
- AI% < 10%

---

**Section 5 — Technical Wins**
Ranked by impact/effort ratio. Per fix:
- Page URL | Issue | **Specific fix** (not "improve speed" — exact change: "compress hero image from 480KB to <100KB, defer render-blocking JS on mobile") | Ranking impact: High/Medium/Low | Hours | Assigned agent

---

**Section 6 — Social Amplification**
Per content piece: LinkedIn (post type + hook + day) | Twitter/X (thread outline, 5–7 tweets) | Instagram (Reel/Carousel concept) | Reddit (subreddit + angle) | Quora (matched question)

---

**Section 7 — AI Overview Targets**
Per query: Query | Current status (we cited / competitor cited / none) | Content approach to get cited (structured answer block, FAQ schema, specific data point)

---

**Section 8 — Metrics to Move**
Per metric: Name | Current value (from Intelligence Report) | Target by sprint end | Measurement method (GSC / GA4 / Odoo) | Tracker

---

**Section 9 — Expert Intelligence Applied** *(required — no exceptions)*
Maps this cycle's research question findings to sprint decisions. Every major tactic in sections 3–4 must cite at least one expert source.

| Sprint Decision | Research Q | Expert / Source | Finding Applied |
|----------------|-----------|----------------|----------------|
| Blog post on [topic] | Q11 | Neil Patel — B2B content conversion patterns | [specific finding this cycle] |
| Data-led Skyscraper article | Q17 | Brian Dean — Skyscraper Technique variants | [specific finding] |
| Branded traffic push | Q3 | Rand Fishkin — SparkToro zero-click data | [specific finding] |
| Attack Vector 1 cluster | Q2 | AI Overview citation patterns | [specific finding] |
| E-E-A-T page rewrite | Q11 | Lily Ray — E-E-A-T signals update | [specific finding] |

---

**Section 10 — History-Backed Rationale** *(required — no exceptions)*
Pulls from previous sprint Google Sheet task trackers. What worked, what didn't, what we're repeating and why. First sprint: section is populated with the baseline data collection run (Intelligence Report findings, site state, initial keyword positions) so Sprint 2 has a starting reference.

| Previous Sprint | Tactic | Outcome | Applied This Sprint? | Reason |
|----------------|--------|---------|---------------------|--------|
| 2026-03-01 | Blog post: [title] | Position 22→11 in 15 days | Yes — same structure for Article 1 | Proven format for informational clusters in this niche |
| 2026-03-01 | Guest post pitch: [site] | Rejected — unsolicited cold email | No | Site doesn't accept cold pitches; try resource page angle instead |
| 2026-03-01 | Quora answer: [question URL] | 3 organic referral sessions in 15 days | Yes — 4 Quora answers this sprint | Quora results rank page 1 for 3 target queries |
| 2026-03-01 | Backlink from [domain] | Link placed, DA 48, still active | Yes — request upgrade to higher-value page | Existing relationship; link can be refreshed |

**Sprint plan saved to:** `/SEO Automation Engine/Sprint Strategies/[YYYY]/Sprint_[YYYY-MM-DD]_to_[YYYY-MM-DD].md`

### SME / Product Owner Review

**Per-website configuration:** The Product Owner agent is the one layer that changes per website at instantiation. Its knowledge base includes: site-specific brand guidelines, product/service scope, competitor positioning, ideal customer profile (ICP), and messaging guardrails. All four websites run the same framework — the Product Owner layer is what makes each deployment site-specific.

**Per-website configuration file — `[website]-product-owner-config.md`**
Stored in the Product Owner agent's OpenClaw memory at instantiation. Loaded at the start of every review cycle. This file is the complete, current source of truth for what the business is, what it sells, and what it is and is not allowed to say.

---

**Content source scan** *(runs at instantiation + refreshed at the start of each sprint cycle)*

The Product Owner agent scans the live website before any strategy review. This keeps the knowledge base current without relying entirely on manual updates. Scan output automatically populates the dynamic fields below.

| Source | URL patterns to scan | What is extracted |
|--------|---------------------|-------------------|
| Solution / service pages | `/solutions/`, `/services/`, root service nav items | Active offerings, positioning language, ICP signals in copy |
| Case studies | `/case-studies/`, `/success-stories/`, `/portfolio/` | Client industries, outcomes, modules/services referenced, social proof data |
| Blog | `/blog/`, `/articles/`, `/insights/` | Topics already covered (gap detection), internal link targets, content tone baseline |
| Documentation pages | `/docs/`, `/documentation/`, `/help/` | Technical depth, feature coverage, accuracy baseline for content claims |
| Testimonials | `/testimonials/`, `/reviews/`, embedded site widgets | Pain points resolved, client segments, language customers use to describe results |
| About / team pages | `/about/`, `/team/` | Named authors + credentials → feeds Named Authors table |

> Scan rule: agent reads these pages via Agent-Browser at the start of every sprint cycle. Findings update the dynamic fields (active scope, ICP, named authors, content gap log). Human-only fields (messaging guardrails, active sprint priorities) are never overwritten by the scan — they require explicit SME input.

> **Scan health check:** After every scan, the agent checks each URL for a successful response (HTTP 200). Any URL that returns 404, redirect loop, or timeout is flagged: `⚠️ Scan failed — [URL] unreachable. Last successful scan: [date]. Dynamic fields from this source not updated this cycle.` This prevents a moved or renamed page from silently breaking knowledge base updates.

---

**Site identity**
- Site name: [website name]
- Domain: [website URL]
- CMS type: WordPress REST API / Decap CMS / [other]

**Active product/service scope** *(auto-populated from solution/service page scan — SME confirms or corrects each quarter)*
- [Service/product 1]: [description + target buyer]
- [Service/product 2]: [description + target buyer]

> Agent rule: only build content for services listed here. Do not write content for discontinued or paused offerings.

**Ideal Customer Profile (ICP)**
- Decision-maker role: [job title]
- Industry verticals: [list]
- Company size: [range]
- Pain points: [3–5 specific problems the product/service solves]
- Their language: [terms and phrases they search; industry jargon they use]

**Competitor positioning**
| Competitor | Our differentiator | What we do NOT claim |
|------------|-------------------|---------------------|
| [Competitor 1] | [e.g., faster implementation, local support team] | [e.g., do not claim lower price — not verified] |
| [Competitor 2] | [e.g., deeper module coverage, better documentation] | [e.g., do not name them directly in content] |

**Messaging guardrails** *(direct implementation of validation question 4)*
- ✅ **CAN say:** [verified, client-approved claims — e.g., "We have implemented for 150+ clients across the GCC"]
- ❌ **CANNOT say:** [prohibited claims — legal, regulatory, or brand reasons — e.g., "We guarantee ROI within 90 days"]
- ❌ **CANNOT say:** Direct competitor disparagement — name-calling or unverified inferiority claims
- ⚠️ **FLAG for human review before publishing:** Pricing claims | SLA guarantees | Specific client names not yet approved for public reference

> Agent rule: if any content piece contains a ❌ claim, the sprint strategy is revision-requested before approval. If it contains a ⚠️ item, it is flagged in the output — not auto-rejected, but held until human SME signs off.

**Named authors** *(E-E-A-T — who can be attributed as content authors on this website)*
| Name | Title | Expertise area | LinkedIn URL | Bio approved? |
|------|-------|----------------|-------------|--------------|
| Uttam | [Title, BiztechCS] | [Expertise area — TBD] | [URL — TBD] | Pending |
| Nandeep | [Title, BiztechCS] | [Expertise area — TBD] | [URL — TBD] | Pending |

**Active sprint priorities this quarter**
[Filled by SME at the start of each sprint cycle — what the business is pushing this quarter that content must support. Example: "Q2 focus is Odoo Manufacturing module — all articles should reference MRP use cases where possible."]

---

**What the Product Owner agent does in the workflow:**

**Step 1 — Trigger**
Fired automatically after the SEO Strategist saves the draft sprint plan. The Product Owner agent does not run on a schedule — it runs in response to a completed strategy draft.

**Step 2 — Load knowledge base**
Reads `[website]-product-owner-config.md` from OpenClaw memory. If more than 15 days have passed since the last content source scan, re-runs the scan before reviewing the strategy.

**Step 3 — Read the draft strategy**
Reads the full draft sprint plan in sequence: Attack Vectors → Content Offensive → Off-Page Offensive → Technical Wins → Expert Intelligence Applied → History-Backed Rationale.

**Step 4 — Validate against config**
Checks every section against the loaded knowledge base:
- Are the attack vectors targeting keywords relevant to active products/services? Or are they going after topics the business has deprioritised or doesn't sell?
- Do content briefs reference case studies and product features that exist and are currently active?
- Are competitor claims accurate and not in violation of the CANNOT say list?
- Do any content pieces or outreach pitches contain ❌ CANNOT say items or ⚠️ FLAG items?
- Is the ICP language in briefs consistent with how the business describes its buyers?
- Are there product features, differentiators, or proof points the strategy is missing that should be embedded?

**Step 5 — Output: APPROVED or REVISION REQUEST**
- ✅ **APPROVED** — plan is aligned. Product Owner appends optional additions: specific case studies to reference in each article, product features to embed in copy, ICP language to use, proof points to cite. Forwards approved plan to Business Layer.
- 🔁 **REVISION REQUEST** — lists specific, actionable changes required (not general feedback). Each revision item states: which section, what the issue is, and what the fix should be. Returned to SEO Strategist as hard constraints for the next draft.

**Step 6 — Reform loop**
SEO Strategist receives revision list, reforms only the flagged sections, and resubmits. Product Owner does a targeted re-review of changed sections only — not a full re-read.

**Loop cap: maximum 3 iterations.** If the strategy has not been approved after 3 full reform cycles, the loop stops and a human escalation is triggered: both the SEO Strategist and the human SME are notified via Telegram with the full revision history. Human SME makes the final call — approves as-is, overrides the rejection, or provides direct instruction. This prevents a misconfigured config file from creating an infinite loop.

**Step 7 — Forward to Business Layer**
Approved plan (with Product Owner additions embedded) is passed to the Business Layer for final human sign-off via Telegram.

---

### Sprint Interrupt Protocol

The Algorithm Intelligence agent runs always-on. When it detects a qualifying event during an active sprint, a sprint interrupt is triggered. The frozen strategy is not reformed — but active tasks may be paused at POC discretion.

**What qualifies:**
- Confirmed Google core algorithm update (Search Engine Roundtable confirmation required — not volatility noise alone)
- AND MozCast volatility > 75 for 3+ consecutive days OR one or more top 20 lead pages drops > 10 positions within 48 hours

**What does NOT qualify:**
- Unconfirmed flux, single-day spikes, competitor movements alone

**Interrupt flow:**
1. Algorithm Intelligence detects qualifying event
2. Telegram alert to POC: `⚠️ SPRINT INTERRUPT — [event]. [X] lead pages affected. Reply: PAUSE / CONTINUE / ASSESS`
3. POC options:
   - `PAUSE` — content publishing paused; technical + off-page continue unless affected
   - `CONTINUE` — sprint continues; interrupt logged
   - `ASSESS` — Algorithm Intelligence produces rapid-response brief within sprint window; POC decides after reading
4. Decision logged in task sheet as interrupt event
5. PAUSE: affected tasks carried to next sprint as Priority 1 — not dropped

**No timeout auto-action.** If no POC reply within 6 hours, reminder sent. Sprint continues until reply received.

---

Sprint plan forwarded to Product Owner agent, which validates:
- Angle aligned with what the business is actively selling this quarter?
- Competitor claims accurate and fact-checked?
- Product features or case studies that should be referenced in the content?
- Any compliance or messaging guardrails to apply? *(answered by the config file above)*

**Output:** `APPROVED` + optional additions → forward to Business Layer
**OR:** Revision request list → back to SEO Strategist → reformed → resubmitted to Product Owner

### Business Layer

The Business Layer sits between the Product Owner's approved strategy and the human Project POC. It has two jobs: (1) automated validation of the strategy against business constraints, and (2) presenting the validated strategy to the Project POC via Telegram for final task selection and go-ahead.

---

#### `[website]-business-config.md`

Set once annually. Agent derives per-sprint allocations automatically. No sprint-by-sprint input required.

| Category | Detail |
|----------|--------|
| Annual business goals | Lead volume, MQL/SQL targets, revenue targets, market positioning. Divided by 26 sprints for per-sprint tracking. Referenced by MQL/SQL performance analysis each cycle. |
| Annual budget | Total SEO budget divided by 26 sprints. Strategy built independent of budget — options tiered by priority so POC selects based on available allocation. Per-sprint budget is a soft guide, not an auto-rejection threshold — POC makes the final call on task selection. |
| Seasonality weights | Optional. Assign percentage of annual target per quarter (e.g., Q1: 20%, Q2: 28%, Q3: 30%, Q4: 22%) to reflect known business seasonality. If not set, annual ÷ 26 flat distribution is used. |
| Content quotas | Hardcoded per website (see table below). Sprint-level override allowed with a mandatory written reason — logged in sprint sheet. |
| Newsletter rules | Per website — frequency, focus, tone. Hardcoded. |
| Sprint definition | Always 2 weeks = 26 sprints per year. |
| Social media cap | Max 12 posts/month per website. |
| Primary POC | BiztechCS + AppJetty: 1 shared POC. PrintXpand + CRMJetty: 1 shared POC. Each POC group has one shared Telegram group — all alerts and approvals in the same group. |
| Fallback POC | Required field. Named individual notified if primary POC does not respond within 24 hours. Sprint never auto-executes without a human GO. |

**Content Quotas (per sprint):**

| Website | Blog Posts | Listicles | Free Backlinks | Paid Backlinks | Quora | Reddit | LinkedIn Newsletter |
|---------|-----------|-----------|---------------|---------------|-------|--------|-------------------|
| BiztechCS | Max 10 | Max 3 | Max 100 | Max 20 | Max 5 | Max 5 | Min 1/sprint |
| PrintXpand | Max 4 | Max 3 | Max 100 | Max 20 | Max 5 | Max 5 | Min 1/sprint |
| CRMJetty | Max 4 | Max 3 | Max 100 | Max 20 | Max 5 | Max 5 | Min 1/sprint |
| AppJetty | Max 2 | Max 3 | Max 100 | Max 20 | Max 5 | Max 5 | Max 1 per 2 sprints |

**Quota override audit (quarterly):**
At the end of each quarter (every 13 sprints), the Business Validation Agent reviews override history per website per content type. If any quota was overridden in more than 50% of sprints in the quarter, a Telegram flag is generated for the POC:
> `⚠️ Quota review — [Website]: [content type] quota overridden in [N] of [13] sprints this quarter. Current limit: [X]. Consider revising the annual quota. Reply REVISE [new limit] or KEEP to dismiss.`
This makes the quota system self-correcting — frequent overrides signal the quota no longer reflects operational reality.

**LinkedIn Newsletter rules (all websites):** Journalistic · Research-driven · Logical · Decision-maker oriented

| Website | Newsletter Focus |
|---------|----------------|
| BiztechCS | Odoo, Product Engineering services, AI |
| PrintXpand | Print industry as a whole |
| CRMJetty | Salesforce, Dynamics, AI use cases, Customer Portal, Partner Portal, Business Central |
| AppJetty | Any AppJetty offering |

---

#### Business Validation Agent

Runs automatically each sprint after Product Owner approval. No manual input required.

**Validation checks:**
1. **Quota compliance** — every content type within sprint limits? Sprint-level override is accepted only if it includes a written reason.
2. **Goal alignment** — does the strategy serve the annual business goals (per-sprint target slice, seasonality-adjusted if weights are set)?
3. **MQL/SQL performance check** — previous sprint actuals vs per-sprint target. Before flagging underperformance, reads the `performance_context` field from the Intelligence Report JSON. If the Intelligence Layer has already identified an external cause (algorithm update, data gap), that context is presented alongside the actuals — underperformance is not misread as strategic failure.
4. **Topic territory (BiztechCS only)** — enforces Odoo + AI + Product Engineering; flags any out-of-scope content for removal
5. **Other websites** — topic direction comes from Intelligence Layer + Product Owner; Business Layer verifies qty only
6. **Budget-tiered options** — presents strategy as Priority 1 / Priority 2 / Optional tiers. Includes a total estimated task cost per tier. If POC selects tasks that together exceed the per-sprint budget allocation, the system flags it: `⚠️ Selected tasks exceed per-sprint budget by [X]%`. POC confirms or adjusts — the system does not auto-reject, but the overage is visible before GO is given.

**Does NOT own:**
- ICP definition → Product Owner + SME layer
- Quality gates → SEO Strategist, Content Editor, domain expert layers
- Topic direction for PrintXpand, CRMJetty, AppJetty → Intelligence Layer + Product Owner

---

#### Human POC Gate — Telegram

After validation agent runs, Project POC is notified on Telegram:

```
📋 SPRINT STRATEGY — [Start Date] to [End Date]

ATTACK VECTOR 1: [brief]
ATTACK VECTOR 2: [brief]
ATTACK VECTOR 3: [brief]

PRIORITY 1 TASKS: [list]
PRIORITY 2 TASKS: [list]
OPTIONAL TASKS: [list — activate if budget allows]

MQL/SQL vs target (last sprint): [actuals vs per-sprint target]
Budget allocation: [per-sprint amount] | Remaining annual: [amount]

📄 Full strategy: [Google Drive link]

Pick tasks, adjust priorities if needed, then reply GO.
```

**POC actions:**
- Select or drop tasks from the list
- Reorder priorities
- Reply `GO` with any adjustments noted

**On GO:**
1. Tasks created in exact accordance with POC's selections and priority order
2. Google Sheet sprint task sheet auto-populated (see Module 5)
3. Sprint PM layer runs: distributes tasks across 10 working days (Mon–Fri), assigns agents, sets dependencies
4. Sheet shared with team
5. Telegram confirmation: `✅ Sprint [dates] live. 10-day schedule set. Task sheet: [Sheets link]. First tasks trigger tonight.`
6. Execution agents launch overnight per daily schedule — all tasks for the day complete before the following morning

**Strategy freeze:**
Once the Business Layer approves the strategy, it is frozen. The POC gate is task-level only — pick, drop, or reorder tasks. POC's final selections are saved as the definitive sprint plan. No back-and-forth after Business Layer approval.

**Escalation:** No reply within 24 hours → reminder posted to `TELEGRAM_APPROVAL_CHAT_ID`. No reply within 48 hours → direct Telegram message to designated decision-maker.

---

## 5.5 Module: Sprint Project Management (Daily Orchestration)

### Overview
Once the POC sends GO, the Sprint PM layer converts the confirmed task list into a 10-day daily schedule and triggers execution agents each night. It does not execute — it orchestrates.

**Sprint calendar:** Always starts Monday, runs 10 working days (Mon–Fri × 2 weeks). The full Intelligence → Business pipeline runs on Saturday. POC reviews Saturday evening and gives GO by Sunday. Sprint begins Monday — no gap.

**Machine assignment:**
- **Machine 1** — BiztechCS (trigger: 9PM Mon–Fri) + AppJetty (trigger: 12:30AM Tue–Sat)
- **Machine 2** — PrintXpand (trigger: 9PM Mon–Fri) + CRMJetty (trigger: 12:30AM Tue–Sat)

Tasks run overnight. Agents complete all assigned tasks same day (Claude agents complete to-dos in hours). Outputs ready for human review the following morning.

**Holiday handling:** Mac Mini is always-on. Agent tasks run on public holidays. Telegram approval responses may be delayed — acceptable since no action auto-executes without human input.

---

### Task Distribution Logic

**Scheduling model: qty ÷ days**
Total approved tasks per type ÷ number of available days for that type = tasks per day. Each daily to-do is a fixed-size batch. All tasks complete overnight.

*Example: 4 blog posts approved, 4 writing days = 1 article per day.*

**Rules:** Dependencies scheduled day after upstream completes (minimum 1-day gap). Independent tasks share a day and run in parallel. Priority overlay: P1 → Days 1–4 | P2 → Days 4–7 | Optional → Days 8–10.

| Day | Task Batch |
|-----|-----------|
| Day 1 | All technical SEO fixes + all off-page outreach dispatched |
| Days 2–5 | Writing batch (articles ÷ 4 days, Quora/Reddit distributed evenly) |
| Days 3–6 | Editing batch (each piece edited day after written) |
| Days 5–7 | Graphics + HTML preview (day after editing per piece) |
| Days 6–8 | Telegram approval requests sent (human-gated) |
| Days 8–9 | Publishing (day after approval received) |
| Days 9–10 | Social scheduling + LinkedIn newsletter |

> Batch sizes adjust to actual approved task count. Dropped task types pull forward earliest pending P2 tasks.

---

### Google Sheet — PM Columns Added

| Column | Values |
|--------|--------|
| Assigned Day | 1–10 |
| Assigned Date | Specific calendar date (Mon–Fri only) |
| Assigned Agent | Execution agent responsible |
| Status | Pending → In Progress → Done / Blocked / Rolled Over |
| Dependency | Task ID this task depends on (blank if independent) |

---

### Overnight Trigger

**Machine 1 — BiztechCS: 9:00 PM Mon–Fri | AppJetty: 12:30 AM Tue–Sat**
**Machine 2 — PrintXpand: 9:00 PM Mon–Fri | CRMJetty: 12:30 AM Tue–Sat**

1. PM agent reads sprint task sheet for this website
2. Filters rows: Assigned Date = today, Status = Pending
3. Triggers each execution agent with full task brief
4. Agent: Status → In Progress → Done on completion
5. Outputs ready for human review next morning

**Missed trigger detection:** If any tasks remain Pending past 11:59 PM, Telegram alert: `⚠️ [Website] — [N] tasks Pending. Trigger may have failed. Manual trigger required.`

---

### Rollover (blocked tasks only)

Claude agents complete tasks the same night. Rollovers occur only when a task is genuinely blocked — external dependency, API failure, or human approval not yet received.

1. Blocked tasks marked `Blocked — [reason]` by agent
2. PM agent checks Blocked rows each night before triggering
3. **Independent blocked:** auto-reassigns to next available day. Telegram alert to POC.
4. **Dependent blocked:** downstream dependents also shift. Full dependency chain sent to POC.
5. **Hard rule:** No task dropped. Carries to next sprint as Priority 1 if unresolved at sprint end.

---

### Sprint Interrupt Interaction

On POC PAUSE (from Sprint Interrupt Protocol):
- PM marks all content publishing tasks as Paused — not rolled over
- Technical and off-page tasks continue unless directly affected
- Paused tasks held until POC replies CONTINUE or sprint ends
- At sprint end: paused tasks carry to next sprint as Priority 1

---

## 6. Module: Execution Agents

### Agent Roster

| # | Agent | Layer | Trigger |
|---|-------|-------|---------|
| 1 | Technical SEO Specialist | Execution | Task sheet row assigned to this agent |
| 2 | Off-Page SEO Orchestrator | Execution | Task sheet rows tagged Off-Page |
| 3 | Content Writer | Execution | Brief from Content Strategist |
| 4 | Content Editor | Execution | Draft from Content Writer |
| 5 | Graphics Designer | Execution | Approved draft from Content Editor |
| 6 | Outreach Manager | Execution | Outreach list from Off-Page SEO Orchestrator |
| 7 | Publishing Agent | Execution | Approval received via Telegram |
| 8 | Social Media Engine | Execution | Publishing Agent confirms publication |

### Content Types & Targets

| Content Type | Platform | Length | AI Score Gate | Posting Method |
|-------------|----------|--------|--------------|----------------|
| Blog post | [website] | 2,000–3,500 words | < 8% | Publishing Agent → CMS API |
| Guest post | External site | 1,200–2,000 words | < 8% | Delivered as formatted Doc to outreach contact |
| Quora answer | Quora | 300–600 words | < 8% | **MANUAL** — agent drafts, human posts |
| Reddit answer | Reddit | 200–500 words | < 8% | **MANUAL** — agent drafts, human posts |
| GitHub answer | GitHub | 150–400 words | < 8% | GitHub API — automated |
| Digital PR pitch | Media outreach | 400–600 words | Quality review (no AI gate) | Odoo email module |

### Off-Page SEO Channels

| Channel | Agent Output | Delivery |
|---------|-------------|----------|
| Direct backlink outreach | Prioritised target list (domain, URL, contact email, angle) + outreach email copy | Outreach Manager → Odoo email module |
| Guest posts | Content brief + target site + contact email | Content Writer produces draft → Outreach Manager delivers via Odoo |
| Reddit engagement | Drafted answers for selected threads | Saved to `/Outreach/Sprint_[dates]/reddit-queue.md` → Telegram alert to human |
| Quora answers | Drafted answers for selected questions | Saved to `/Outreach/Sprint_[dates]/quora-queue.md` → Telegram alert to human |
| GitHub answers | Drafted answers for selected discussions | GitHub API — automated post via PAT |
| Digital PR | Data-driven pitch + media list | Outreach Manager → Odoo email module |

### Content Editor Responsibilities

All content passes through the Content Editor before any approval or publication step:

- Runs `/humanize` subskill — full humanization pass
- AI score gate: **< 8% for all articles** (enforced — hard block if failed, returns to Content Writer)
- Keyword tally: required keywords verified at required frequency
- E-E-A-T signal check: author attribution present, experience signals in content, citations where needed
- Structural check: opening hook, CTAs positioned correctly, internal links present, headings schema-ready
- Does NOT publish — produces final approved draft saved to Drive only

### Graphics Designer Agent

- **Input received:** Approved content draft (from Content Editor) + section breakdown + brand guidelines
- **Output produces:** GPT-Image-1 / DALL-E 3 compatible image generation prompts, one per content section requiring an image; video storyboard (60-second explainer outline) for key content pieces
- **Naming convention:** `[site]-[content-type]-[slug]-[section].png`
  - Example: `biztechcs-blog-odoo-crm-implementation-hero.png`
- **Saved to:** `/SEO Automation Engine/Content Assets/Sprint_[YYYY-MM-DD]/[slug]/`
- After images generated: passes complete package (content + images) to HTML Preview Generator

---

## 7. Module: HTML Visual Preview + Approval

### Scope

**Website content only** (blog posts, landing pages, any page publishing to [website] or a related domain).

Off-platform content (guest posts, Quora, Reddit, GitHub) is reviewed as a plain text Google Doc in Drive — same Telegram approval pattern, no HTML rendering needed.

### HTML Generation

- Engine: Puppeteer (Node.js) renders branded HTML template
- Template uses [website] site CSS (CSS filenames provided at instantiation)
- Preview includes: full page layout with brand fonts/colors, all images embedded, OG metadata block, schema markup validation summary, mobile layout (responsive CSS)
- **Saved to Drive:** `/SEO Automation Engine/HTML Previews/Sprint_[YYYY-MM-DD]/[slug].html`
- This file IS the publishing source — what the reviewer sees is exactly what publishes. No reformatting.

### Approval Notification (Telegram)

Telegram bot posts to `TELEGRAM_APPROVAL_CHAT_ID`:

```
📄 Content Ready for Review: [Article Title]
Type: [Blog Post / Landing Page]
Target keyword: [keyword]
AI Score: [X]% ✅   Keyword Tally: PASS ✅

🔗 HTML Preview (Drive): [Google Drive direct link to .html file]
🖼 Images folder (Drive): [Google Drive folder link]

Reply:
APPROVE — publishes exactly this file
REJECT — returns to Content Editor + Graphics
REVISE [your instructions] — targeted edits, same Drive link updated
```

**APPROVE:**
- Publishing Agent reads HTML file from the exact Drive path
- Publishes to CMS — no reformatting, no reprocessing
- HTML file archived (moved to `/Approved/` subfolder, not deleted)
- Google Sheet row updated: status → Published

**REJECT:**
- Content Editor + Graphics Designer cycle repeats from the point of failure
- Old HTML file deleted from `/HTML Previews/Sprint_[dates]/`
- New HTML saved under the same path once revised
- New Telegram notification sent with same format

**REVISE [instructions]:**
- Instructions passed to Content Editor with specific revision scope
- Targeted edits only — not a full rewrite unless instructions require it
- Updated HTML overwrites the same Drive file at the same path
- Reviewer re-checks the same Drive link (it now shows the revised version)
- Telegram notification: `📄 Revised: [Title] — same preview link updated. Please re-review.`

---

## 8. Module: Google Drive Logs + Google Sheet Task Tracker

### Drive Folder Structure

```
/SEO Automation Engine/
│
├── Intelligence Reports/
│   └── [YYYY]/
│       └── [SiteName]-SEO-Intelligence-Report_[YYYY]_[MM-DD].pdf
│
├── Sprint Strategies/
│   └── [YYYY]/
│       └── Sprint_[YYYY-MM-DD]_to_[YYYY-MM-DD].md
│
├── Content Assets/
│   └── Sprint_[YYYY-MM-DD]/
│       └── [slug]/
│           ├── [slug]-draft.md            ← Content Writer output
│           ├── [slug]-edited.md           ← Content Editor output
│           ├── [slug]-hero.png
│           ├── [slug]-section-2.png
│           └── [slug]-video-storyboard.md
│
├── HTML Previews/
│   └── Sprint_[YYYY-MM-DD]/
│       ├── [slug].html                    ← Review + publish source
│       └── Approved/
│           └── [slug].html               ← Archived after publish
│
├── Outreach/
│   └── Sprint_[YYYY-MM-DD]/
│       ├── backlink-targets.xlsx
│       ├── guest-post-targets.xlsx
│       ├── outreach-log.xlsx
│       ├── reddit-queue.md               ← Manual post queue
│       └── quora-queue.md                ← Manual post queue
│
├── Social/
│   └── Sprint_[YYYY-MM-DD]/
│       ├── idea-bank.md
│       └── [platform]-[post-title]-assets/
│
└── Logs/
    └── [YYYY-MM-DD]-agent-run-log.json
```

### Google Sheet Task Tracker

**One sheet per sprint.** Auto-created when Business Layer approves the sprint strategy.
Sheet name: `Sprint [YYYY-MM-DD] to [YYYY-MM-DD]`

**Columns:**

| Sr | Task Type | Title / Target | Assigned Agent | Status | Started | Completed | Drive Link | Notes |
|----|-----------|---------------|---------------|--------|---------|-----------|------------|-------|
| 1 | Blog Post | Odoo CRM Implementation | Content Writer | In Progress | 2026-04-01 | — | [link] | AI: 6.2% |
| 2 | Backlink | target-domain.com | Off-Page SEO | Not Started | — | — | — | — |

**Status values (in order):**
`Not Started` → `In Progress` → `Pending Review` → `Approved` → `Published` → `Done`

**Auto-update rules:**
- Every agent writes back to its assigned row via Google Sheets API on each status change
- Date fields (`Started`, `Completed`) populated automatically by the agent at state transition
- Drive Link populated when the agent saves its output file

**Notifications:**
- Google Sheets notifies all collaborators on every change (native Sheets "Notify on changes" setting)
- Critical milestones (Pending Review, Published) additionally trigger Telegram bot ping to `TELEGRAM_GROUP_ID`

---

## 9. Module: Social Media Engine

### Philosophy

Journalistic thought leadership — not a content distribution bot.

- **Journalistic:** Report on industry news, data, and algorithm changes with an authoritative, specific POV. Own the narrative.
- **Thought leadership:** Opinions that are specific, defensible, and sometimes contrarian. Not generic tips.
- **Content mix:** 50% from our generated content (insights, frameworks, data). 50% from industry/tech news with our expert commentary layered on.
- **Platform-native:** Each platform gets its native format. No copy-paste across channels.

### Platforms & Cadence

| Platform | Frequency | Primary Formats | Posting Method |
|----------|-----------|----------------|----------------|
| LinkedIn | 4×/week | Text post, Carousel PDF, Poll, Short article | SocialPilot API |
| Facebook | 3×/week | Reel script, Image post, Link post | SocialPilot API |
| Instagram | 4×/week | Carousel, Reel script, Story | SocialPilot API |
| Twitter/X | Daily | Thread (5–7 tweets), Single take, Commentary | SocialPilot API |
| Reddit | 2×/week | Long-form discussion post, Value-first answer | **MANUAL** — human posts |
| Quora | 2×/week | Detailed expert answer | **MANUAL** — human posts |

### 14-Day Calendar Flow

**Step 1 — Aggregation:**
Agent pulls from two source streams:
- Industry news: Search Engine Roundtable RSS, Google blog RSS, Moz blog RSS, relevant LinkedIn influencer posts via Agent-Browser
- Our published content: new articles and pages published this sprint

**Step 2 — Idea Bank Generation:**
Agent produces a numbered idea bank — ideas only, no copy yet.

```
Idea #3
Platform: LinkedIn | Format: Carousel (6 slides)
Angle: "5 signals your CRM implementation is already failing — and what to do about each"
Source: Our Odoo CRM blog post + Gartner CRM failure stat (68% of implementations miss ROI targets)
Thought leadership hook: Most consultants tell you what to implement. We tell you when it's already failing.
Why this wins: Contrarian angle, specific number, addresses fear not aspiration
```

**Step 3 — Idea Approval (Telegram):**
Full idea bank posted to `TELEGRAM_APPROVAL_CHAT_ID`.
Each idea numbered. Human responds:
- `✅ [number]` — approved
- `❌ [number]` — skip
- `🔄 [number] [revised angle]` — reformulate

**Step 4 — Post Creation:**
For each approved idea:
- Full platform-native copy written (character limits enforced per platform)
- Image/graphic brief generated for Graphics Designer
- Hashtag strategy included (researched, not generic)
- Optimal posting time recommended (based on audience timezone — business hours IST/EST for LinkedIn; evenings for Instagram)
- Reddit/Quora posts drafted and saved to `/Social/Sprint_[dates]/reddit-queue.md` and `quora-queue.md`

**Step 5 — Post Approval (Telegram):**
Each post (copy + image preview + hashtags + proposed time) shared as a package to `TELEGRAM_APPROVAL_CHAT_ID`.

```
📱 Post Ready for Approval
Platform: LinkedIn | Format: Carousel
Scheduled: [Date] at [Time]

Copy preview:
[first 2 lines of post]...

🖼 Images: [Drive link]
📄 Full copy: [Drive link]

Reply APPROVE / REJECT / REVISE [instructions]
```

**Step 6 — Scheduling:**
- Approved posts (all except Reddit/Quora): SocialPilot API schedules at recommended time
- Reddit/Quora: saved to manual queue files in Drive → Telegram alert to human: `📋 [X] Reddit/Quora posts ready for manual posting. Queue: [Drive link]`
- Google Sheet logged: platform, post title, scheduled time, Drive link, status

### Social Link Sharing Strategy (per published blog post)

Every published article automatically triggers this cross-platform distribution plan:

| Platform | Action | Method |
|----------|--------|--------|
| LinkedIn | LinkedIn Article cross-post with canonical tag pointing back to site | SocialPilot API |
| Twitter/X | Thread — 5 key insights from the article | SocialPilot API |
| Facebook | Link post with custom excerpt | SocialPilot API |
| Instagram | Key stat from article as carousel slide | SocialPilot API |
| Reddit | Value-first answer in relevant subreddit — link in comments only, not in post body | **MANUAL** |
| Quora | Expert answer to matching question | **MANUAL** |
| Medium | Cross-post with canonical back to site (long-term E-E-A-T signal) | **MANUAL** — low priority |

---

## 10. Agent Interaction Map

This section documents every agent's exact behaviour — what it receives, what it does, what it produces, who it hands off to, what it writes to Drive/Sheets, and how it handles failures. A build team should be able to implement each agent from this section alone.

### Master Interaction Table

| Agent | Receives From | Produces | Hands Off To | Writes to Drive | Updates Sheets |
|-------|--------------|----------|-------------|-----------------|----------------|
| Intelligence Report Orchestrator | launchd cron trigger | PDF report + JSON summary | Sprint Strategy Agent + Odoo email + Telegram | `/Intelligence Reports/YYYY/[filename].pdf` | No (creates new sheet at sprint approval) |
| SEO Strategist | Intelligence Report JSON summary | Sprint plan document (Markdown) | Product Owner Agent | `/Sprint Strategies/YYYY/Sprint_[dates].md` | No |
| Product Owner Agent | Sprint plan document | Approved plan OR revision list | Business Layer (Telegram) OR SEO Strategist | Appends approval notes to sprint plan file | No |
| Business Layer (human via Telegram) | Sprint plan summary + Drive link | APPROVE or REJECT with reason | Task Sheet Populator (on APPROVE) OR SEO Strategist + Product Owner (on REJECT) | No | No |
| Task Sheet Populator | Approved sprint plan | Populated Google Sheet | All Execution Agents | No | Creates sprint sheet, populates all rows |
| Technical SEO Specialist | Task sheet rows (type = Technical) | Implemented fixes + change log | SEO Expert Reviewer | `/Logs/[date]-technical-changes.md` | Updates assigned rows: In Progress → Done |
| Keyword Research Analyst | Product Owner's validated service areas + GSC data | Keyword universe per topic cluster | Content Strategist | `/Sprint_[dates]/keyword-universe.json` | Updates assigned rows |
| Content Strategist | Keyword universe + sprint plan content section | Content briefs (one per article) | Content Writer | `/Sprint_[dates]/[slug]-brief.md` | Updates rows: Not Started → In Progress |
| Content Writer | Content brief | Draft article/content | Content Editor | `/Content Assets/Sprint_[dates]/[slug]/[slug]-draft.md` | Updates row: In Progress |
| Content Editor | Draft from Content Writer | Humanized, gated draft OR revision request | Graphics Designer (PASS) or Content Writer (FAIL) | `/Content Assets/Sprint_[dates]/[slug]/[slug]-edited.md` | Updates row: Pending Review (PASS) |
| Graphics Designer | Approved edited draft + brief | Image prompts + generated images + storyboard | HTML Preview Generator (website) or Publishing queue (off-platform) | `/Content Assets/Sprint_[dates]/[slug]/[image files]` | Updates row |
| HTML Preview Generator | Edited content + images | Branded HTML preview file | Telegram approval notification | `/HTML Previews/Sprint_[dates]/[slug].html` | Updates row: Pending Review |
| Business/Content Approval (human via Telegram) | Telegram message with Drive preview link | APPROVE / REJECT / REVISE | Publishing Agent (APPROVE) or Content Editor (REJECT/REVISE) | No | No |
| Publishing Agent | Approved HTML from Drive | Published page/post on CMS | Social Media Engine (triggers distribution) | Archives HTML to `/Approved/` subfolder | Updates row: Published → Done |
| Off-Page SEO Orchestrator | Sprint plan off-page section + task sheet rows | Outreach target list + briefs + Reddit/Quora drafts | Outreach Manager + Content Writer (for guest posts) + Drive (for manual queues) | `/Outreach/Sprint_[dates]/[various files]` | Updates Off-Page rows |
| Outreach Manager | Outreach emails from Off-Page SEO | Sent outreach emails (via Odoo) + reply log | Human (on replies, via Telegram flag) | `/Outreach/Sprint_[dates]/outreach-log.xlsx` | Updates Outreach rows: In Progress → Done |
| Social Media Engine | Published content + industry news | Idea bank + approved posts + scheduled posts + manual queues | SocialPilot API + Manual queue Drive files + Telegram | `/Social/Sprint_[dates]/[post assets]` | Updates Social rows |
| Page Diagnosis Agent | Cooldown-expired page URL + fix tier + Sheet history + GSC data + QMD algorithm log | Page Diagnosis Brief (full history + algorithm overlay + cross-pattern analysis + recommended action) | SEO Strategist (mandatory read before fix task is created) | `/Content Assets/Sprint_[dates]/[slug]-diagnosis-brief.md` | Adds `Diagnosis Brief — Ready` row above new fix task row |

---

### Individual Agent Cards

---

#### AGENT: Intelligence Report Orchestrator

**Role in OpenClaw:** `intelligence-report/orchestrator.md`

**Trigger:**
macOS launchd every other Saturday at 06:00. Trigger fires the OpenClaw agent directly via a shell script.

**Receives:**
- No agent input. Reads from: GA4 API, GSC API, Clarity API, Odoo XML-RPC, in-built ranking flow output file, Wayback CDX API, Ahrefs Webmaster API, RSS feeds.

**Process (subskills called in sequence):**

1. `pull-ga4-data.md` — calls GA4 Data API for sessions, conversions, organic traffic. Window: MTD, QTD, YTD for each.
2. `pull-gsc-data.md` — calls GSC API for top 1000 queries (position, impressions, CTR). Compares to last cycle's saved snapshot.
3. `pull-ranking-data.md` — reads output file from client's in-built ranking flow. Parses top 50 keyword positions.
4. `pull-odoo-leads.md` — Odoo XML-RPC `crm.lead` query. Extracts Leads, MQLs, SQLs for MTD/QTD/YTD. Source breakdown.
5. `pull-clarity-data.md` — Clarity API call for top rage-click pages, top dead-click pages, average scroll depth by page.
6. `competitor-monitor.md` — for each competitor domain: sitemap XML diff, RSS feed diff, Wayback CDX API query. Applies fail-safe cascade if blocked.
7. `algorithm-signals.md` — Agent-Browser scrapes Search Engine Roundtable for updates since last cycle. Queries MozCast public API for volatility score.
8. `run-20-questions.md` — calls Claude Opus with deep web research enabled. Each of the 20 questions run as a structured prompt. Output: finding + specific action recommendation per question.
9. `assemble-report.md` — combines all data into a structured JSON summary + a formatted HTML report template.
10. `generate-pdf.md` — Puppeteer renders HTML template to PDF. Saves to `/SEO Automation Engine/Intelligence Reports/[YYYY]/[SiteName]-SEO-Intelligence-Report_[YYYY]_[MM-DD].pdf`

**Produces:**
- PDF report (saved to Drive)
- `report-summary.json` (saved to `/Sprint Strategies/[YYYY]/` — input for SEO Strategist)

**Hands off to:**
- SEO Strategist Agent (passes `report-summary.json` path)
- Odoo email module (sends PDF to stakeholder list)
- Telegram bot: posts `📊 Intelligence Report ready — [date]. Drive: [link]` to `TELEGRAM_GROUP_ID`

**Error handling:**
- If any single data source fails (e.g., Clarity API down): logs error to `/Logs/[date]-agent-run-log.json`, marks that section as "Data unavailable — [reason]" in report, continues with remaining sources. Does not abort full run.
- If Odoo XML-RPC fails: falls back to reading last saved Excel export from designated folder. Flags in report: "Lead data from Excel export [date] — API unavailable."
- If PDF generation fails: saves HTML version to Drive, alerts via Telegram: `⚠️ PDF generation failed. HTML version saved: [link]`

---

#### AGENT: SEO Strategist

**Role in OpenClaw:** `seo-strategist/orchestrator.md`

**Trigger:** Intelligence Report Orchestrator passes `report-summary.json` path.

**Receives:**
- `report-summary.json` — structured output from Intelligence Report
- `previous-sprint-summary.json` — results of last sprint (from Sheets or previous strategy file) — to avoid repeating what didn't work

**Process (subskills):**

1. `read-intelligence-brief.md` — parses `report-summary.json`. Extracts: top keyword opportunities, competitor moves, algorithm findings, lead flow trends, best practice actions.
2. `identify-attack-vectors.md` — from the brief, identifies 3 highest-leverage attack vectors for the next 15 days. Framing: structural advantage, not reactive fixes.
3. `build-content-offensive.md` — for each attack vector, defines specific articles/pages: title, target keyword, target position, competitor being displaced, unique angle.
4. `build-offpage-offensive.md` — specific backlink targets, guest post angles, digital PR story opportunities tied to the attack vectors.
5. `build-technical-wins.md` — technical fixes from Intelligence Report ranked by impact/effort ratio. Top 5 included.
6. `define-metrics.md` — for each planned action, defines the exact metric to move and baseline.
7. `write-sprint-plan.md` — assembles all sections into a clean Markdown document.

**Produces:**
- `Sprint_[YYYY-MM-DD]_to_[YYYY-MM-DD].md` saved to `/Sprint Strategies/[YYYY]/`

**Hands off to:** Product Owner Agent (passes sprint plan file path)

**Error handling:**
- If `report-summary.json` is malformed or missing sections: Telegram alert to `TELEGRAM_GROUP_ID`: `⚠️ Intelligence Report incomplete. Missing: [sections]. SEO Strategist paused — manual check needed.`
- Waits for human to resolve before proceeding.

---

#### AGENT: Product Owner

**Role in OpenClaw:** `product-owner/orchestrator.md`

**Trigger:** SEO Strategist passes sprint plan file path.

**Receives:**
- Sprint plan Markdown file
- ICP definition and service area priority list (stored in QMD memory — seeded once by human, updated quarterly)

**Process (subskills):**

1. `validate-business-alignment.md` — checks each attack vector against current service priorities. Flags any vector targeting a service the business is not actively selling.
2. `check-competitor-claims.md` — verifies any specific competitor claims in the strategy are accurate (Agent-Browser search where needed).
3. `enrich-with-product-context.md` — adds product features, case studies, or proof points that should be referenced in the planned content.
4. `apply-guardrails.md` — applies messaging compliance rules (stored in QMD memory). Flags any language or claims that violate brand or legal guardrails.
5. `produce-review-output.md` — if all checks pass: outputs `APPROVED` + enrichment notes. If any fail: outputs structured revision request list.

**Produces:**
- `APPROVED` with enrichment notes appended to sprint plan file
- OR revision request list → passed back to SEO Strategist

**Hands off to:**
- Business Layer (Telegram) with approved plan
- OR SEO Strategist with revision requests

**Error handling:**
- If QMD memory is missing ICP or service area data: Telegram alert: `⚠️ Product Owner missing ICP/service area data in QMD. Cannot validate strategy. Please seed data before next cycle.`

---

#### AGENT: Task Sheet Populator

**Role in OpenClaw:** `task-sheet-populator/orchestrator.md`

**Trigger:** Business Layer sends `APPROVE` reply to Telegram bot.

**Receives:**
- Approved sprint plan file path (from sprint plan saved in Drive)
- Google Sheet template ID

**Process:**

1. `parse-sprint-plan.md` — reads sprint plan Markdown. Extracts every action item (each article, each backlink target, each technical fix, each social idea, each outreach email).
2. `create-sprint-sheet.md` — Google Sheets API: creates new sheet from template. Names it `Sprint [start date] to [end date]`.
3. `populate-rows.md` — for each action item: creates one row. Sets: Sr (auto-increment), Task Type, Title/Target, Assigned Agent, Status = "Not Started". Leaves Started/Completed/Drive Link blank.
4. `share-sheet.md` — shares the sheet with team members (email list from config). Sets "Notify on changes" for all collaborators.
5. `notify-team.md` — Telegram bot posts to `TELEGRAM_GROUP_ID`: `✅ Sprint approved. Task sheet live: [Sheets link]. [X] tasks queued. Execution begins.`

**Produces:**
- Populated Google Sheet (Sprint task tracker)

**Hands off to:** All Execution Agents (they read the sheet to find their assigned rows)

**Error handling:**
- If Sheets API fails: saves task list as CSV to Drive, Telegram alert with CSV link. Retries Sheet creation every 10 minutes for 1 hour before escalating.

---

#### AGENT: Content Writer

**Role in OpenClaw:** `content-writer/orchestrator.md`

**Trigger:** Content Strategist saves a content brief file to Drive and updates the task sheet row to "In Progress."

**Receives:**
- Content brief file: `/Content Assets/Sprint_[dates]/[slug]/[slug]-brief.md`
  - Brief contains: target keyword, secondary keywords, intended SERP position, competitor being beaten, unique angle, word count target, content type, required sections, internal links to include, case studies/product features to reference, author to attribute

**Process (subskills):**

1. `analyse-brief.md` — parses brief. Confirms all required fields present.
2. `research-topic.md` — Agent-Browser: reads top 5 ranking pages for target keyword, PAA boxes, related searches. Extracts angles, data points, gaps.
3. `write-draft.md` (Opus for blog posts, Sonnet for off-platform) — writes draft per brief. Enforces: opening hook does not start with subject name, no em dashes in body text, no tricolon parallel lists, no two-sentence paired closes.
4. `check-brief-compliance.md` — verifies: target keyword in H1, secondary keywords distributed, required sections all present, internal links included, product/case study references included, word count within ±10% of target.
5. `save-draft.md` — saves to `/Content Assets/Sprint_[dates]/[slug]/[slug]-draft.md`

**Produces:**
- `[slug]-draft.md` saved to Drive

**Hands off to:** Content Editor

**Updates Sheets:** Row status → "Pending Review"

**Error handling:**
- If Agent-Browser research returns no results: logs warning, proceeds with draft using Claude's knowledge. Adds footnote in draft: `[RESEARCH NOTE: Agent-Browser returned no results for this topic. Stats and examples below are from model knowledge — verify before publishing.]`
- If word count compliance fails: flags in draft header, does not self-correct (that is the Content Editor's gate).

---

#### AGENT: Content Editor

**Role in OpenClaw:** `content-editor/orchestrator.md`

**Trigger:** Content Writer saves draft to Drive.

**Receives:**
- `[slug]-draft.md` from Content Writer

**Process (subskills):**

1. `run-humanize.md` — full `/humanize` pass: vocabulary swap, em dash removal (replace with comma/colon/period/parentheses), contractions, you-language, expert tips (2–4 Pro tips for blog posts), cross-source synthesis check, ZeroGPT pattern removal.
2. `score-ai.md` — internal AI scorer: exit 0 = PASS (≤8%), exit 1 = FAIL.
   - **FAIL:** returns draft to Content Writer with specific ZeroGPT pattern flags. Cycle repeats. Maximum 3 cycles before Telegram escalation: `⚠️ [Slug] AI score not passing after 3 attempts. Human review needed.`
3. `keyword-tally.md` — verifies target keyword frequency, secondary keyword distribution, LSI term presence.
   - **FAIL:** targeted keyword additions only (not a full rewrite). Re-scores.
4. `eeat-check.md` — confirms: author attribution in byline, at least one first-person experience signal, citations where claims are made, CTA positioned at natural conclusion point.
5. `structure-check.md` — opening hook quality, H2/H3 hierarchy correct and schema-ready, internal links working (no dead targets), meta description drafted.
6. `save-edited.md` — saves to `/Content Assets/Sprint_[dates]/[slug]/[slug]-edited.md`

**Produces:**
- `[slug]-edited.md` saved to Drive (PASS)
- OR revision request back to Content Writer (FAIL)

**Hands off to:** Graphics Designer (on PASS)

**Updates Sheets:** Row status → "In Progress" (if returned to Writer) or "Pending Review" (on PASS)

**Error handling:**
- AI scorer unavailable: logs error, flags draft for human manual review. Telegram alert: `⚠️ AI scorer unavailable. [Slug] needs manual AI check before proceeding.`

---

#### AGENT: Graphics Designer

**Role in OpenClaw:** `graphics-designer/orchestrator.md`

**Trigger:** Content Editor saves `[slug]-edited.md` to Drive.

**Receives:**
- `[slug]-edited.md` — approved content
- Brand guidelines (stored in QMD memory): [website] colors, typography, button styles — loaded at instantiation

**Process (subskills):**

1. `analyse-content-sections.md` — reads edited draft. Identifies: hero section (needs hero image), each H2 section that benefits from a supporting image, any data/stats that should be visualised as a graphic.
2. `write-image-prompts.md` — for each image needed: writes a detailed GPT-Image-1 compatible prompt. Prompt includes: subject description, brand color palette (`#222222`, `#ff812e`, `#fbfaf5`), style (photorealistic/illustrative), composition, text overlays if any.
3. `generate-images.md` — calls image generation API (GPT-Image-1 or DALL-E 3). Saves each image to `/Content Assets/Sprint_[dates]/[slug]/` with naming convention `[site]-[content-type]-[slug]-[section].png`.
4. `write-video-storyboard.md` (for pillar content only) — writes a 60-second explainer storyboard: scene-by-scene breakdown, on-screen text, voiceover script outline.
5. `save-assets.md` — confirms all assets saved to Drive. Logs asset manifest: `/Content Assets/Sprint_[dates]/[slug]/asset-manifest.json`

**Produces:**
- Image files + storyboard (if applicable) in Drive asset folder
- `asset-manifest.json` — list of all assets with Drive paths

**Hands off to:** HTML Preview Generator (website content) or Publishing queue (off-platform)

**Updates Sheets:** Row status remains "Pending Review" (HTML Preview step follows)

**Error handling:**
- If image generation API fails or returns unusable result: saves placeholder file `[slug]-[section]-PLACEHOLDER.png` with the prompt text embedded. Flags in `asset-manifest.json`. Telegram alert: `⚠️ Image generation failed for [slug] — [section]. Placeholder saved. Manual image needed.`

---

#### AGENT: HTML Preview Generator

**Role in OpenClaw:** `html-preview-generator/orchestrator.md`

**Trigger:** Graphics Designer saves `asset-manifest.json` to Drive.

**Receives:**
- `[slug]-edited.md` — approved content
- `asset-manifest.json` — all image Drive paths
- [website] CSS template files (provided at instantiation)

**Process:**

1. `build-html.md` — Puppeteer renders branded HTML. Injects: content, images (from Drive paths), OG metadata block, schema markup (Article/HowTo/FAQ as appropriate per content type), meta description, canonical URL.
2. `validate-html.md` — checks: all images load, no broken internal links, schema markup validates, mobile layout renders correctly.
3. `save-preview.md` — saves to `/SEO Automation Engine/HTML Previews/Sprint_[YYYY-MM-DD]/[slug].html`
4. `notify-approval.md` — Telegram bot posts approval message to `TELEGRAM_APPROVAL_CHAT_ID` (format specified in Module 7).

**Produces:**
- `[slug].html` saved to Drive at exact preview path

**Hands off to:** Business/Content Approval (human via Telegram)

**Updates Sheets:** Row → "Pending Review"

**Error handling:**
- If Puppeteer render fails: saves raw Markdown to Drive, Telegram alert: `⚠️ HTML render failed for [slug]. Markdown preview: [Drive link]. Please review manually.`

---

#### AGENT: Publishing Agent

**Role in OpenClaw:** `publishing-agent/orchestrator.md`

**Trigger:** Human replies `APPROVE` to the Telegram approval message for a specific slug.

**Receives:**
- Slug identifier (extracted from Telegram reply context)
- HTML file path: `/SEO Automation Engine/HTML Previews/Sprint_[YYYY-MM-DD]/[slug].html`
- CMS credentials (from `.keys/.env`)

**Process:**

1. `read-approved-html.md` — reads the exact HTML file from Drive. This is the publishing source — no modifications.
2. `extract-metadata.md` — parses HTML for: title, meta description, canonical URL, OG tags, schema markup, author slug, publish date, category tags.
3. `upload-images.md` — uploads all images from `/Content Assets/Sprint_[dates]/[slug]/` to CMS media library. Gets back CMS URLs. Updates image `src` attributes in HTML from Drive paths to CMS URLs.
4. `publish-to-cms.md` — WordPress REST API (or Decap CMS git commit): creates new post/page with content, metadata, images. Sets status to `published`.
5. `verify-live.md` — waits 30 seconds. Agent-Browser fetches the live URL. Confirms: page loads, title matches, images render, no 404.
6. `archive-html.md` — moves HTML file from `/HTML Previews/Sprint_[dates]/[slug].html` to `/HTML Previews/Sprint_[dates]/Approved/[slug].html`
7. `notify-published.md` — Telegram post to `TELEGRAM_GROUP_ID`: `✅ Published: [Title] — [live URL]`
8. `trigger-social.md` — passes published URL and content brief to Social Media Engine to begin distribution plan.

**Produces:**
- Live published page/post
- Archived HTML in Drive

**Hands off to:** Social Media Engine

**Updates Sheets:** Row → "Published" → "Done"

**Error handling:**
- If CMS API returns error: logs error, Telegram alert: `⚠️ Publishing failed for [slug]. Error: [error message]. HTML still at [Drive link]. Manual publish needed.`
- If live verification fails (404 or wrong content): Telegram alert: `⚠️ Published but live check failed for [slug] — [URL]. Please verify manually.`

---

#### AGENT: Off-Page SEO Orchestrator

**Role in OpenClaw:** `offpage-seo/orchestrator.md`

**Trigger:** Task sheet rows with type "Off-Page" become active after sprint approval.

**Receives:**
- Sprint plan off-page section (from `/Sprint Strategies/[YYYY]/Sprint_[dates].md`)
- Task sheet rows assigned to Off-Page

**Process (subskills):**

1. `identify-link-targets.md` — for each attack vector: Agent-Browser identifies top link opportunities. For broken link building: searches for relevant resource pages with dead links. For skyscraper: identifies pages linking to competitor's version of our target content.
2. `build-guest-post-list.md` — identifies relevant sites accepting guest posts in our topic area. Researches contact emails (Agent-Browser or Hunter.io).
3. `produce-reddit-quora-drafts.md` — identifies high-traffic Reddit threads and Quora questions matching our target topics. Drafts value-first answers for each. Saves to:
   - `/Outreach/Sprint_[dates]/reddit-queue.md`
   - `/Outreach/Sprint_[dates]/quora-queue.md`
   - Telegram alert to `TELEGRAM_GROUP_ID`: `📋 [X] Reddit posts and [Y] Quora answers ready for manual posting. Queue: [Drive link]`
4. `build-digital-pr-pitches.md` — identifies a data-driven PR angle from the Intelligence Report. Drafts a journalist pitch. Identifies media contacts.
5. `build-outreach-emails.md` — for backlink outreach and guest post pitches: drafts personalised outreach emails. Saves to `/Outreach/Sprint_[dates]/backlink-targets.xlsx` and `guest-post-targets.xlsx`.

**Produces:**
- Outreach email list + targets (Drive)
- Guest post briefs (passed to Content Writer)
- Reddit/Quora draft queue files (Drive + Telegram alert to human)
- Digital PR pitch document (Drive)

**Hands off to:**
- Outreach Manager (passes outreach email list)
- Content Writer (passes guest post briefs)

**Updates Sheets:** Off-page rows → "In Progress"

---

#### AGENT: Outreach Manager

**Role in OpenClaw:** `outreach-manager/orchestrator.md`

**Trigger:** Off-Page SEO Orchestrator passes outreach email list.

**Receives:**
- `backlink-targets.xlsx` and `guest-post-targets.xlsx` from Drive
- Odoo email module credentials

**Process:**

1. `review-emails.md` — reads each outreach email. Checks: personalisation token filled, no placeholder text remaining, correct sender name, correct reply-to address.
2. `send-via-odoo.md` — calls Odoo Marketing/Email module API. Sends each email as individual (not bulk campaign) with tracking enabled. Logs: email ID, recipient, timestamp, subject.
3. `monitor-replies.md` — polls Odoo inbox for replies at 6-hour intervals. When a reply is detected: Telegram alert to `TELEGRAM_GROUP_ID`: `📬 Outreach reply from [domain] — [subject line]. View in Odoo: [link]`
4. `update-log.md` — updates `/Outreach/Sprint_[dates]/outreach-log.xlsx` with send status and any replies received.

**Produces:**
- Sent emails (logged in Odoo + outreach-log.xlsx in Drive)
- Reply alerts via Telegram

**Updates Sheets:** Outreach rows → "In Progress" → "Done" (after send confirmed)

**Error handling:**
- If Odoo email API fails: saves emails as draft in Odoo, Telegram alert: `⚠️ Outreach emails queued as drafts in Odoo — API send failed. Manual send needed.`

---

#### AGENT: Page Diagnosis Agent

**Role in OpenClaw:** `page-diagnosis/orchestrator.md`

**Purpose:** A dedicated intelligence agent that activates when a page's 90-day cooldown window expires and the page still requires a fix. It does not execute fixes — it produces a fully reasoned diagnosis brief that the SEO Strategist uses to plan the next action. For second or third tier fixes, it is the only agent authorised to recommend a course of action.

**Trigger:**
Google Sheet tracker is checked every cycle. When a row with `Status: Cooldown` has a `Cooldown Expires` date that has passed AND the page's latest GSC data still shows a problem (position declining, impressions dropping, or GSC Insights still flagging it), the Intelligence Report Orchestrator routes that page to the Page Diagnosis Agent.

**Receives:**
- Page URL
- Fix tier (1st re-fix, 2nd re-fix, 3rd re-fix)
- Google Sheet task history for this page (all previous fix rows)
- Current GSC data for the page (position, impressions, CTR, Insights status)
- Lookback window: 90 days for Tier 1 re-fix | 6 months for Tier 2 and Tier 3

**Process (subskills):**

1. `compile-fix-history.md` — reads all previous fix task rows from Google Sheets for this page URL. For each fix: what was changed, date applied, performance before (from report snapshot at time of fix), performance after (from the cycle immediately preceding the verdict).

2. `pull-performance-timeline.md` — pulls GSC API data for the page across the full lookback window (90 days or 6 months). Builds a position/impressions/CTR timeline at 15-day intervals — one data point per sprint cycle.

3. `overlay-algorithm-updates.md` — reads the QMD log maintained by the Algorithm Intelligence agent. Extracts every confirmed or suspected Google algorithm update within the lookback window. Overlays each update date onto the performance timeline. For each update: checks whether the page's position shifted by more than 3 places within 14 days of the update. Flags update-correlated shifts separately from fix-correlated shifts.

4. `cross-pattern-analysis.md` (Opus) — synthesises the full picture:
   - Which fixes correlated with improvement, even temporarily?
   - Which fixes had zero measurable effect?
   - Which fixes correlated with further decline?
   - Did any decline correlate with an algorithm update rather than our changes? If so, which update type (content quality / helpful content / spam / links / core)?
   - Is the page recovering, plateauing, or in continued decline across the lookback window?
   - Are competitors who rank above this page exhibiting signals that explain the gap (more depth, more backlinks, stronger E-E-A-T)?

5. `produce-diagnosis-brief.md` (Opus) — writes the diagnosis brief in the following structure:

```
PAGE DIAGNOSIS BRIEF
────────────────────────────────────────────────────
Page:         [URL]
Fix Tier:     [1st / 2nd / 3rd re-fix]
Lookback:     [90 days / 6 months]
Prepared by:  Page Diagnosis Agent — [date]

FIX HISTORY
  Fix 1 — [Date]: [What was changed]
    Before: Position [X] | Impressions [X] | CTR [X]%
    After:  Position [X] | Impressions [X] | CTR [X]%
    Verdict: ✅ Recovered / ⏳ In Progress / ❌ Not Recovered

  Fix 2 — [Date]: [What was changed]
    Before / After / Verdict: ...

ALGORITHM EVENTS IN WINDOW
  [Date] — [Update name] — Confirmed/Suspected
    Type: [content quality / helpful content / spam / links / core]
    Page impact: Position [X→X] within 14 days — Likely correlated: Yes/No

PERFORMANCE TIMELINE (per sprint cycle)
  [Date]: Position [X] | Impressions [X] | CTR [X]%
  [Date]: Position [X] | Impressions [X] | CTR [X]%
  ...

CROSS-PATTERN FINDINGS
  [Agent's synthesised observations — what worked, what didn't, what Google did]

DIAGNOSIS
  Root cause assessment: [Content quality gap / Technical issue / Authority deficit /
  Algorithm sensitivity / Topical relevance / Other]
  Confidence: [High / Medium / Low] — [reason for confidence level]

RECOMMENDED ACTION
  Option A (primary): [Specific action — not generic. E.g., "Expand the H2 section
  on [topic] with first-hand data — competing pages citing original research rank
  above this page on the same query. The content depth gap is measurable."]

  Option B (if Option A is insufficient after next cooldown): [Escalation path —
  e.g., consolidate with [related URL] / redirect / full rewrite / build 3 backlinks
  from [domain type] before re-evaluating]

  Do NOT repeat: [Specific actions from prior fixes that had zero or negative effect]
────────────────────────────────────────────────────
```

6. `save-and-route.md` — saves the brief to `/SEO Automation Engine/Content Assets/Sprint_[dates]/[slug]-diagnosis-brief.md`. Passes the brief to the SEO Strategist as a mandatory input. Adds a row to the Google Sheet: Task Type = `Diagnosis Brief`, Status = `Ready`, Drive Link = [brief path].

**Produces:**
- Page Diagnosis Brief (Drive)
- Task row in Google Sheet

**Hands off to:** SEO Strategist (who reads the brief before planning any fix task for this page)

**Updates Sheets:** Adds `Diagnosis Brief — Ready` row above the new fix task row for this page

**Fail-safe:**
- If GSC API fails during `pull-performance-timeline.md`: falls back to Drive-cached GSC export data. Diagnosis proceeds with available data, brief notes which data points are from cache.
- If QMD has no algorithm update log for the window: brief notes "No algorithm events recorded in QMD for this window — manual check of Search Engine Roundtable recommended."
- If Opus API fails during analysis subskills: falls back to Sonnet. Brief is flagged: `Analysis produced by claude-sonnet-4-6 — Opus unavailable at time of run.`

---

#### AGENT: Social Media Engine

**Role in OpenClaw:** `social-media/orchestrator.md`

**Trigger:**
- Publishing Agent signals a new article is live (passing published URL)
- Also runs independently every Monday morning to aggregate industry news for the week's social calendar

**Receives:**
- Published article URL + content brief
- Industry news RSS feed outputs (Search Engine Roundtable, Google blog, Moz blog, etc.)

**Process (subskills):**

1. `aggregate-news.md` — pulls RSS feeds. Filters for items published since last cycle. Agent-Browser checks relevance to our industry and audience.
2. `build-idea-bank.md` (Opus) — for each content piece and each news item, generates 2–3 social post ideas in the idea card format. Prioritises contrarian angles, specific data points, thought leadership hooks.
3. `post-idea-bank.md` — posts numbered idea bank to `TELEGRAM_APPROVAL_CHAT_ID`. Waits for human responses.
4. `parse-approvals.md` — reads human responses. Maps ✅/❌/🔄 to idea numbers. Builds approved idea list.
5. `write-posts.md` (Sonnet) — for each approved idea: writes platform-native copy (enforcing character limits and format rules per platform). Writes hashtag strategy. Recommends posting time.
6. `brief-graphics.md` — for each post needing an image: writes image brief. Passes to Graphics Designer subagent call.
7. `compile-post-packages.md` — assembles each post: copy + image path + hashtags + posting time → saves to `/Social/Sprint_[dates]/[platform]-[slug]-package.md`
8. `post-approval-requests.md` — sends each post package to `TELEGRAM_APPROVAL_CHAT_ID` for approval (one message per post).
9. `schedule-approved-posts.md` — for each approved post (non-manual platforms): calls SocialPilot API to schedule at recommended time. Logs: platform, title, scheduled time, SocialPilot post ID.
10. `queue-manual-posts.md` — for Reddit and Quora approved posts: appends to queue files in Drive. Telegram alert: `📋 [X] manual posts queued (Reddit/Quora). [Drive link]`

**Produces:**
- SocialPilot-scheduled posts for LinkedIn, Facebook, Instagram, Twitter/X
- Manual queue files for Reddit + Quora (Drive)
- All post assets in `/Social/Sprint_[dates]/`

**Updates Sheets:** Social rows → "In Progress" → "Done" (after scheduled/queued)

**Error handling:**
- SocialPilot API failure: saves post package to Drive, Telegram alert: `⚠️ SocialPilot scheduling failed for [post title]. Package saved: [Drive link]. Manual scheduling needed.`

---

### Agent Communication Protocol

All inter-agent communication follows this pattern (enforced in every orchestrator.md):

```
When passing data to the next agent:
- Never pass raw data — always pass a file path to Drive or a structured JSON summary
- Summary maximum: 500 tokens — compress findings, not raw output
- Format: { "status": "PASS|FAIL", "output_path": "Drive path", "summary": "...", "flags": [] }
- Store full data in QMD workspace for retrieval if any agent needs to look back
- Never pass raw HTML — extract and compress first

Before executing any subskill:
- Query QMD: "Has this analysis been done in the last [N] days?"
  - Rank tracking: 1 day | Keyword research: 7 days | Competitor analysis: 14 days | Technical audit: 7 days
- If recent cached results exist, use them. Do not regenerate.
- If generating new results, save to QMD with date tag.
```

---

## 11. Agent Fail-Safe Protocol

Every agent in this system must continue running regardless of API failures or timeouts. No agent aborts. No data gap silently propagates downstream. Every failure is handled, logged, and substituted — in that order.

### Global Rules (enforced in every orchestrator.md)

1. **Maximum 3 attempts per API call.** Attempt 1 → wait 30 seconds → Attempt 2 → wait 60 seconds → Attempt 3 → activate fallback. No further retries. The agent moves on.
2. **Every failure activates a fallback automatically.** The agent does not pause, alert, or wait for human input. It finds the alternative data source and continues.
3. **Every failure is logged.** Written to `/SEO Automation Engine/Logs/[YYYY-MM-DD]-agent-run-log.json` with: agent name, subskill, API that failed, number of attempts, fallback used, timestamp.
4. **Every fallback is flagged in the report output.** Wherever fallback data was used, the report section is marked: `⚠️ [Source] unavailable — data from [fallback source] as of [date].` The reader always knows what they are looking at.
5. **Fallback data is never silently treated as primary data.** It is clearly labelled. If the fallback is also unavailable, the section is marked `Data unavailable this cycle — [reason]` and the agent continues to the next section.

### Retry Pattern (applied to every API call)

```python
def call_with_failsafe(api_func, fallback_func, max_attempts=3):
    wait_times = [0, 30, 60]  # seconds before each attempt
    for attempt in range(max_attempts):
        try:
            time.sleep(wait_times[attempt])
            return api_func(), "primary"
        except (TimeoutError, APIError, ConnectionError) as e:
            log_failure(api_func.__name__, attempt + 1, str(e))
            if attempt == max_attempts - 1:
                result = fallback_func()
                return result, "fallback"
    return None, "unavailable"
```

### Per-API Fallback Map

| API / Service | Primary Use | Fallback 1 | Fallback 2 | If All Fail |
|--------------|-------------|-----------|-----------|-------------|
| **GA4 Data API** | Traffic, sessions, conversions | Last saved GA4 CSV export from Drive (auto-exported weekly to `/Logs/ga4-export-[date].csv`) | Previous cycle's GA4 data from report summary JSON | Section marked: `GA4 data unavailable — using [date] export` |
| **Google Search Console API** | Rankings, impressions, CTR, index coverage | Last saved GSC export CSV from Drive | Ahrefs Webmaster Tools data for own domain | Section marked: `GSC data unavailable — using [date] export` |
| **GSC Insights (Agent-Browser)** | Trending/downtrending pages | Re-attempt with different user-agent string | Read GSC Performance API for pages with largest impression drop as proxy | Section marked: `GSC Insights unavailable — impression-drop proxy used` |
| **Microsoft Clarity API** | Rage clicks, dead clicks, scroll depth | Pre-scheduled Clarity CSV export read from Drive (`/Logs/clarity-export-[date].csv`) | Skip section, note in report | Section marked: `Clarity data unavailable this cycle` |
| **Odoo XML-RPC API** | Lead, MQL, SQL data | Last Excel export from designated folder (`/Logs/odoo-leads-export-[date].xlsx`) | Previous cycle's lead summary from report JSON | Section marked: `Odoo live data unavailable — using [date] export` |
| **Anthropic Claude API (Opus)** | Research questions, strategy, diagnosis | Retry same prompt with claude-sonnet-4-6 | Retry with claude-haiku-4-5-20251001 | Queue prompt for manual run — section marked `AI analysis pending` |
| **Anthropic Claude API (Sonnet)** | Content writing, analysis | Retry with claude-haiku-4-5-20251001 | Queue task — mark row `Blocked: API` in Sheets | Section/task flagged for retry next cycle |
| **Google Drive API** | All file storage and reads | Save file locally to Mac Mini at `/openclaw-workspace/drive-fallback/[filename]` | Retry Drive upload every 10 minutes for 1 hour | File stays local, Telegram alert: `Drive upload failed — file at [local path]` |
| **Google Sheets API** | Task tracker read/write | Save update as local JSON patch file (`/drive-fallback/sheets-patch-[date].json`) | Retry Sheets write every 10 minutes for 1 hour | Local patch applied when connection restored |
| **Telegram Bot API** | All notifications and approval flows | Retry after 60 seconds | Log message to Drive (`/Logs/telegram-unsent-[date].md`) and retry on next agent cycle | Message logged locally — no silent drop |
| **SocialPilot API** | Social post scheduling | Retry after 60 seconds with reduced payload | Save post package to Drive manual queue (`/Social/manual-schedule-queue.md`) | Telegram alert: `SocialPilot unavailable — [X] posts in manual queue: [Drive link]` |
| **Wayback Machine CDX API** | Competitor monitoring fail-safe | Retry with different CDX parameters (remove filters, broaden query) | Google SERP `site:competitor.com` via Agent-Browser | Competitor section marked: `Wayback unavailable — SERP enumeration used` |
| **Ahrefs Webmaster Tools** | Backlink data for own domain | Cached previous cycle's backlink snapshot from Drive | Skip new backlink section, carry forward previous data | Section marked: `Backlink data from [date] — Ahrefs unavailable` |
| **PageSpeed Insights API** | Core Web Vitals data | Retry with single URL batch (reduce payload) | Read previous cycle's CWV snapshot from Drive | Section marked: `CWV data from [date] — PageSpeed API unavailable` |
| **Odoo Marketing/Email Module** | Report delivery + outreach emails | Save email as draft in Odoo — flag for manual send | Save email content to Drive (`/Outreach/email-drafts-[date]/`) with subject + body + recipient | Telegram alert: `Odoo email failed — [X] drafts saved: [Drive link]` |
| **Reddit API (PRAW)** | Subreddit monitoring (read-only) | Agent-Browser direct scrape of subreddit pages | Skip monitoring this cycle | Section marked: `Reddit monitoring unavailable this cycle` |
| **GitHub API** | Post answers to Discussions/Issues | Retry with reduced payload | Save answer to Drive manual queue (`/Outreach/github-queue.md`) | Telegram alert: `GitHub API failed — answer queued manually: [Drive link]` |
| **SerpAPI / Agent-Browser** | SERP data, competitor research | Retry with simplified query | Use cached SERP data from QMD if available (within 7 days) | Section marked: `SERP data from cache [date]` |
| **MozCast / Algorithm signals** | SERP volatility score | Agent-Browser scrapes Search Engine Roundtable directly | Use previous cycle's volatility score with note | Section marked: `Volatility score from [date] — MozCast unavailable` |

### Agent-Level Fail-Safe Behaviour

Beyond API fallbacks, each agent handles two additional failure modes:

**Timeout (agent takes longer than expected):**
- Every subskill has a maximum execution time defined in its orchestrator.md
- If a subskill exceeds its time limit: it is terminated, its output is marked as incomplete, the agent logs the timeout, and moves to the next subskill
- The orchestrator continues — one slow subskill does not block the entire agent
- Timeout thresholds: Haiku subskills = 60s | Sonnet subskills = 120s | Opus subskills = 300s

**Partial output (subskill produces incomplete data):**
- If a subskill produces output but it is missing required fields: the agent flags the missing fields, fills them with `[unavailable]`, and continues
- The downstream agent that receives this output sees the flags and adjusts its process accordingly — it does not fail, it works around the gaps
- All `[unavailable]` fields are surfaced in the final report so a human can see exactly what data was missing and why

### QMD Cache as Universal Fallback

The QMD semantic memory index serves as the last-resort data layer for any agent. Before marking any data section as unavailable, every agent queries QMD:

```
"What is the most recent data available for [topic/metric/competitor] in this workspace?"
```

If QMD returns a result within an acceptable staleness window (defined per data type), that cached result is used as the fallback and clearly dated in the output. This means the system almost never runs completely blind — there is almost always some version of the data available from a prior run.

---

## 12. Technical Build Reference

### Infrastructure

| Component | Specification |
|-----------|--------------|
| Hardware | Mac Mini (M2 or M4 recommended, 16GB+ RAM) |
| OS | macOS Ventura or later |
| Always-on | Sleep disabled via System Settings → Energy |
| Framework | OpenClaw — `orchestrator.md` + `subskills/*.md` per agent |
| Scheduling | macOS launchd (plist files in `~/Library/LaunchAgents/`) |
| Memory | QMD (semantic memory) — indexes all `.md` files in OpenClaw workspace. Daily re-index via launchd at 02:00. |
| State storage | Google Drive + Google Sheets — no separate database |
| Secrets | `.keys/.env` (existing centralized store) |
| Logging | JSON files saved to Google Drive `/Logs/` per run |

### Languages & Runtimes

| Layer | Language | Runtime | Package manager |
|-------|----------|---------|----------------|
| Agent logic + data processing | Python 3.11+ | Local Python env | pip / venv |
| HTML / PDF rendering | Node.js 20 LTS | Local Node | npm |
| OpenClaw agent definitions | Markdown | OpenClaw runtime | — |

### APIs & Platforms

| API / Platform | Purpose in this system | Auth | Estimated Cost |
|---------------|----------------------|------|----------------|
| **Anthropic Claude API** | All agent LLM calls — Opus (research/strategy), Sonnet (content/analysis), Haiku (monitoring) | API key | ~$15–40/month at this scale |
| **Google Analytics 4 Data API** | Traffic, sessions, conversions, organic share | Service Account JSON — grant Viewer in GA4 Admin | Free |
| **Google Search Console API** | Rankings, impressions, CTR, index coverage | Service Account JSON — add as GSC user | Free |
| **Microsoft Clarity API** | Rage clicks, dead clicks, scroll depth | API key from Clarity Dashboard → Settings → API | Free (API limited — supplement with CSV export) |
| **Odoo XML-RPC API** | Lead, MQL, SQL data from CRM | `{ODOO_URL}/xmlrpc/2/object` + API key | Included with Odoo |
| **Odoo Marketing/Email Module** | Outreach emails + Intelligence Report delivery | Same Odoo instance | Included with Odoo |
| **Google Drive API** | All file storage, HTML previews, asset management | Service Account JSON | Free (within Drive storage) |
| **Google Sheets API** | Sprint task tracker — create, read, write | Service Account JSON | Free |
| **macOS launchd** | Bi-monthly trigger (1st + 16th at 06:00) | N/A (OS-level) | Free |
| **Telegram Bot API** | All notifications + approval flows | Bot token from @BotFather | Free |
| **In-built ranking flow** | Top 50 keyword positions — feeds Intelligence Report | Client's existing system | Existing |
| **SocialPilot API** | Schedule posts across LinkedIn, FB, IG, Twitter/X | API key (requires Business plan) | ~$42–85/month |
| **Reddit API (PRAW)** | Monitor subreddits for opportunities (read-only) | OAuth2 — Client ID + Secret | Free (100 req/min) |
| **GitHub API** | Post answers to GitHub Discussions/Issues | Personal Access Token | Free |
| **Ahrefs Webmaster Tools** | Backlink data for own domains only | Domain verification | Free |
| **Wayback Machine CDX API** | Competitor monitoring fail-safe | None (public API) | Free |
| **Google PageSpeed Insights API** | Core Web Vitals data — our pages + competitor pages | API key (Google Cloud Console) | Free |
| **SerpAPI / Agent-Browser** | SERP data for competitor research and keyword checks | Agent-Browser (built-in to OpenClaw) | Free (rate-limited) |

### Credentials Required (`.keys/.env`)

```env
# Anthropic
ANTHROPIC_API_KEY=

# Google (single Service Account JSON covers GA4, GSC, Drive, Sheets, PageSpeed)
GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/.keys/gcp-service-account.json

# Microsoft Clarity
CLARITY_API_KEY=
CLARITY_PROJECT_ID=

# Odoo
ODOO_URL=
ODOO_DB=
ODOO_USERNAME=
ODOO_API_KEY=

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_GROUP_ID=              # General alerts channel
TELEGRAM_APPROVAL_CHAT_ID=      # Approval channel (strategy, content, social)

# SocialPilot
SOCIALPILOT_API_KEY=

# Reddit (read-only monitoring)
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USERNAME=
REDDIT_PASSWORD=

# GitHub
GITHUB_PAT=

# PageSpeed Insights
PAGESPEED_API_KEY=

# Ahrefs Webmaster Tools
AHREFS_WEBMASTER_TOKEN=

# Google Drive root
SEO_DRIVE_ROOT_FOLDER_ID=1S6-nEOOEOOmoIPnmR0S6xjABrUzyzIDO       # Root folder ID for /SEO Automation Engine/
SPRINT_SHEET_TEMPLATE_ID=       # Template sheet ID to clone per sprint
```

### OpenClaw Agent File Structure

```
~/openclaw-workspace/seo-automation/
│
├── intelligence-report/
│   ├── orchestrator.md
│   └── subskills/
│       ├── pull-ga4-data.md
│       ├── pull-gsc-data.md
│       ├── pull-ranking-data.md
│       ├── pull-odoo-leads.md
│       ├── pull-clarity-data.md
│       ├── competitor-monitor.md
│       ├── algorithm-signals.md
│       ├── run-20-questions.md
│       ├── assemble-report.md
│       └── generate-pdf.md
│
├── seo-strategist/
│   ├── orchestrator.md
│   └── subskills/
│       ├── read-intelligence-brief.md
│       ├── identify-attack-vectors.md
│       ├── build-content-offensive.md
│       ├── build-offpage-offensive.md
│       ├── build-technical-wins.md
│       ├── define-metrics.md
│       └── write-sprint-plan.md
│
├── product-owner/
│   ├── orchestrator.md
│   └── subskills/
│       ├── validate-business-alignment.md
│       ├── check-competitor-claims.md
│       ├── enrich-with-product-context.md
│       ├── apply-guardrails.md
│       └── produce-review-output.md
│
├── task-sheet-populator/
│   ├── orchestrator.md
│   └── subskills/
│       ├── parse-sprint-plan.md
│       ├── create-sprint-sheet.md
│       ├── populate-rows.md
│       ├── share-sheet.md
│       └── notify-team.md
│
├── content-writer/
│   ├── orchestrator.md
│   └── subskills/
│       ├── analyse-brief.md
│       ├── research-topic.md
│       ├── write-draft.md
│       ├── check-brief-compliance.md
│       └── save-draft.md
│
├── content-editor/
│   ├── orchestrator.md
│   └── subskills/
│       ├── run-humanize.md
│       ├── score-ai.md
│       ├── keyword-tally.md
│       ├── eeat-check.md
│       ├── structure-check.md
│       └── save-edited.md
│
├── graphics-designer/
│   ├── orchestrator.md
│   └── subskills/
│       ├── analyse-content-sections.md
│       ├── write-image-prompts.md
│       ├── generate-images.md
│       ├── write-video-storyboard.md
│       └── save-assets.md
│
├── html-preview-generator/
│   ├── orchestrator.md
│   └── subskills/
│       ├── build-html.md
│       ├── validate-html.md
│       ├── save-preview.md
│       └── notify-approval.md
│
├── publishing-agent/
│   ├── orchestrator.md
│   └── subskills/
│       ├── read-approved-html.md
│       ├── extract-metadata.md
│       ├── upload-images.md
│       ├── publish-to-cms.md
│       ├── verify-live.md
│       ├── archive-html.md
│       ├── notify-published.md
│       └── trigger-social.md
│
├── offpage-seo/
│   ├── orchestrator.md
│   └── subskills/
│       ├── identify-link-targets.md
│       ├── build-guest-post-list.md
│       ├── produce-reddit-quora-drafts.md
│       ├── build-digital-pr-pitches.md
│       └── build-outreach-emails.md
│
├── outreach-manager/
│   ├── orchestrator.md
│   └── subskills/
│       ├── review-emails.md
│       ├── send-via-odoo.md
│       ├── monitor-replies.md
│       └── update-log.md
│
├── social-media/
│   ├── orchestrator.md
│   └── subskills/
│       ├── aggregate-news.md
│       ├── build-idea-bank.md
│       ├── post-idea-bank.md
│       ├── parse-approvals.md
│       ├── write-posts.md
│       ├── brief-graphics.md
│       ├── compile-post-packages.md
│       ├── post-approval-requests.md
│       ├── schedule-approved-posts.md
│       └── queue-manual-posts.md
│
├── technical-seo/
│   ├── orchestrator.md
│   └── subskills/
│       ├── schema-audit.md
│       ├── crawl-budget.md
│       ├── core-web-vitals.md
│       ├── redirect-chain-cleanup.md
│       └── indexation-monitor.md
│
└── competitor-watch/
    ├── orchestrator.md
    └── subskills/
        ├── daily-content-monitor.md
        ├── weekly-ranking-monitor.md
        └── backlink-alert.md
```

### Model Assignment Per Agent / Subskill

| Agent / Subskill | Model | Reason |
|-----------------|-------|--------|
| `run-20-questions.md` | claude-opus-4-6 | Deep web research, strategic synthesis |
| `identify-attack-vectors.md`, `build-content-offensive.md` | claude-opus-4-6 | Offensive strategy requires highest reasoning |
| `build-idea-bank.md` (social) | claude-opus-4-6 | Thought leadership quality |
| `write-draft.md` (blog posts) | claude-opus-4-6 | Long-form quality |
| All Content Editor subskills | claude-sonnet-4-6 | Humanization, tone analysis |
| `write-posts.md` (social) | claude-sonnet-4-6 | Platform-native copy |
| `write-image-prompts.md` | claude-sonnet-4-6 | Creative prompts |
| All Technical SEO subskills | claude-haiku-4-5-20251001 | Structured data extraction, fast checks |
| `algorithm-signals.md` | claude-haiku-4-5-20251001 | Fast daily monitoring |
| `daily-content-monitor.md` | claude-haiku-4-5-20251001 | High-frequency, structured output |
| `pull-ga4-data.md`, `pull-gsc-data.md`, `pull-odoo-leads.md` | claude-haiku-4-5-20251001 | Data formatting, no reasoning needed |
| `validate-business-alignment.md` | claude-sonnet-4-6 | Judgment call, not pure data |
| `competitor-monitor.md` | claude-sonnet-4-6 | Pattern recognition across diff outputs |

---

## 12. Implementation Roadmap

| Phase | Scope | Weeks |
|-------|-------|-------|
| **Phase 0 — Foundation** | Mac Mini setup, OpenClaw install, all API credentials provisioned, Drive folder structure created, Sheets template built, Telegram bot created and tested, SocialPilot API access confirmed | 1–2 |
| **Phase 1 — Intelligence Report** | All data pull subskills (GA4, GSC, Odoo, Clarity, ranking flow reader), competitor monitor with fail-safe cascade, algorithm signals scraper, 20-question Opus research subskill, PDF generator (Puppeteer template), biweekly Saturday launchd trigger, Odoo email delivery, Telegram alert | 3–4 |
| **Phase 2 — Sprint Strategy Engine** | SEO Strategist agent, Product Owner agent, Business Layer Telegram approval handler (bot reads APPROVE/REJECT replies), reform loop (rejection → strategy regeneration), Task Sheet Populator (Sheets API), sprint kickoff notification | 5–6 |
| **Phase 3 — Content Pipeline** | Content Strategist, Content Writer, Content Editor (humanize + AI gate), Graphics Designer (image prompt generation + API calls), HTML Preview Generator (Puppeteer), Telegram approval handler for content, Publishing Agent (CMS API), Google Sheet write-back at each step | 7–10 |
| **Phase 4 — Off-Page & Outreach** | Off-Page SEO Orchestrator, Outreach Manager (Odoo email module), Reddit/Quora manual queue files + Telegram alerts, GitHub answer posting (API), Digital PR pitch generation | 9–11 (parallel with Phase 3) |
| **Phase 5 — Social Media Engine** | Industry news RSS aggregator, Idea Bank generator, Telegram idea approval handler, Platform-native post writer, SocialPilot API scheduling, manual queue for Reddit/Quora, social link sharing automation per published article | 12–14 |
| **Phase 6 — Continuous Watch Agents** | Algorithm Intelligence (daily scrape), Best Practices Monitor (monthly digest), Competitor Watch (daily/weekly cadence), all feeding into Intelligence Report and Strategy layers | 13–15 (parallel) |
| **Phase 7 — Optimization** | QMD cache tuning, token cost audit, model routing verification, multi-property config (PrintXpand as second instance), Looker Studio dashboard on top of Sheets data | 15–16 |

---

## 13. Open Questions (Confirm Before Build Begins)

| # | Question | Why it blocks build |
|---|----------|---------------------|
| 1 | ⏳ **Odoo setup:** Cloud vs. self-hosted, instance URL, XML-RPC endpoint — Project Implementation Team to Review | Required for XML-RPC connection string |
| 2 | ✅ **MQL/SQL definition:** Odoo native MQL and SQL fields on `crm.lead` — read directly, no custom filter needed | Resolved |
| 3 | ✅ **Lead source attribution:** Custom cookie on websites feeds Odoo automatically. Odoo classifies as Organic, Outbound, and other business-relevant sources. No UTM setup needed. | Resolved — attribution coverage check updated |
| 4 | ✅ **Competitor list:** Defined in Product Owner / SME agent config at instantiation per website. Not required upfront. | Resolved |
| 5 | ✅ **Telegram only. One group per POC group** — all alerts and approvals in the same Telegram group. No separate channels. | Resolved |
| 6 | ⏳ **SocialPilot plan:** To be Confirmed — API requires Business plan or higher | Without API access, social scheduling cannot be automated |
| 7 | ✅ **Clarity:** Not yet installed. Installing Clarity (script + project ID) is a pre-build task before behaviour data can be pulled. | Required before Intelligence Report can pull Clarity data |
| 8 | ⏳ **Publishing CMS:** WordPress REST API or Decap CMS — to be finalised per website in implementation phase | Publishing Agent integration depends on this |
| 9 | ✅ **Stakeholder email list:** Deferred to execution phase — will be configured when project moves into execution. | Odoo email module recipient list set at execution |
| 10 | ✅ **Google Drive root folder ID:** `1S6-nEOOEOOmoIPnmR0S6xjABrUzyzIDO` — set as `SEO_DRIVE_ROOT_FOLDER_ID` in config. | Resolved |

---

*This document is the single master reference for the SEO Automation Engine. It supersedes all previous versions: the original OpenClaw blueprint, the redesigned agent system, the technical specification, and the project outline. All prior files in this folder remain as historical reference only.*
