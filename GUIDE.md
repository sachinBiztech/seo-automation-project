# SEO Automation Engine — Project Guide
**What we need to build, in order, and why.**

---

## Current State (What Already Exists)

| Item | Status |
|------|--------|
| `intelligence-report/orchestrator.md` | Partial — mock mode only |
| `intelligence-report/subskills/pull-gsc-data.md` | Partial — reads mock JSON, not real API |
| `intelligence-report/subskills/analyze-data.md` | Partial |
| `intelligence-report/subskills/generate-insights.md` | Partial |
| `seo-strategist/orchestrator.md` | Partial |
| `seo-strategist/subskills/read-intelligence-brief.md` | Partial |
| `mock-data/*.json` | Done — used for testing only |
| `outputs/` | Demo run artifacts |

**Everything else listed below does not exist yet.**

---

## Build Order (Phases 1–8)

Follow this order strictly — each phase feeds the next.

---

## Phase 1 — Foundation & Data Layer
> Replace mock data with real API calls. Set up per-website config.

### 1A — Config Files (one-time per website, stored in OpenClaw memory)

Create two files per website (4 websites = 8 files total):

**`[website]-product-owner-config.md`**
- Site name, domain, CMS type
- Active products/services in scope
- Ideal Customer Profile (ICP)
- Named authors for E-E-A-T (e.g., BiztechCS: Uttam, Nandeep)
- Competitor positioning — what we CAN / CANNOT / must FLAG say
- Active sprint priorities this quarter

**`[website]-business-config.md`**
- Annual goals (leads, MQLs, SQLs) ÷ 26 sprints
- Annual SEO budget ÷ 26 sprints
- Seasonality weights Q1–Q4
- Content quotas per sprint (hardcoded):

| Website | Max Blogs | Max Listicles | Free BL | Paid BL | Quora | Reddit | LinkedIn NL |
|---------|-----------|---------------|---------|---------|-------|--------|------------|
| BiztechCS | 10 | 3 | 100 | 20 | 5 | 5 | min 1/sprint |
| PrintXpand | 4 | 3 | 100 | 20 | 5 | 5 | min 1/sprint |
| CRMJetty | 4 | 3 | 100 | 20 | 5 | 5 | min 1/sprint |
| AppJetty | 2 | 3 | 100 | 20 | 5 | 5 | max 1/2 sprints |

- Primary + Fallback POC Telegram IDs
- Newsletter rules, social media cap (12 posts/month)

---

### 1B — Data Pull Subskills (upgrade mocks → real APIs)

All live under `intelligence-report/subskills/`:

| File | API | Key Output |
|------|-----|------------|
| `pull-ga4-data.md` | BigQuery SQL (GA4 native export) | Sessions, conversions, organic share — 15d/90d/180d |
| `pull-gsc-data.md` | BigQuery SQL (GSC native export) — **UPGRADE existing** | Top 1000 queries, positions, CTR, impressions |
| `pull-ranking-data.md` | Client's in-built ranking output file | Top 50 keyword positions, MoM/QoQ delta |
| `pull-odoo-leads.md` | Odoo XML-RPC (`crm.lead`) | Leads/MQLs/SQLs MTD/QTD/YTD, source + landing page |
| `pull-clarity-data.md` | Microsoft Clarity REST API v0 | Rage clicks, dead clicks, scroll depth per page |
| `competitor-monitor.md` | Sitemap diff + RSS + Wayback + Ahrefs | New competitor pages, posts, backlinks |
| `algorithm-signals.md` | Search Engine Roundtable + MozCast API | Confirmed updates, volatility score |
| `run-20-questions.md` | Claude Opus + web research | 20 structured SEO findings + action recs |

**Data Quality Gate rule:** CRITICAL failures (GA4, GSC, Odoo, Rankings) = release report with gap noted. WARNING failures (Clarity, competitor, algo signals) = omit section, continue. No silent failures.

**Also build:**
- `analyze-data.md` — **UPGRADE** existing partial
- `generate-insights.md` — **UPGRADE** existing partial

---

### 1C — Page Cooldown Tracker
Implemented as part of the Google Sheet (Phase 4), but the logic is:
- Fixed pages enter 90-day cooldown on completion
- Cooldown expiry logged in sheet
- During cooldown: page is monitored only, no new tasks
- On expiry: route to Page Diagnosis Agent (Phase 5) before any new fix

### 1D — Previous Sprint Fix Verification
Intelligence Report Orchestrator at each cycle start:
1. Read previous sprint sheet — extract rows where Task Type = fix/technical + Status = Done
2. Check current GSC + Insights data for each page
3. Output verdict table (Recovered / In Progress / Not Recovered) in report

---

## Phase 2 — Intelligence Report (Production)
> Full report generated, exported as PDF, delivered automatically.

### Files to build:

**`intelligence-report/subskills/assemble-report.md`**
Combines all data pull outputs into:
- `report-summary.json` — machine-readable handoff to SEO Strategist
- Formatted HTML report with 8 sections: Cover, Executive Summary, Lead Flow Dashboard, Rankings Snapshot, Algorithm Status, Competitor Watch, Best Practices (20Q condensed), Appendix

**`intelligence-report/subskills/generate-pdf.md`**
- Puppeteer (Node.js) renders HTML → PDF
- Filename: `[SiteName]-SEO-Intelligence-Report_[YYYY]_[MM-DD].pdf`
- Saved to Drive: `/SEO Automation Engine/Intelligence Reports/[YYYY]/`
- Fallback on PDF failure: save HTML, Telegram alert with link

**`intelligence-report/subskills/deliver-report.md`**
- Odoo email sends PDF to stakeholder list
- Telegram alert: `📊 Intelligence Report ready — [date]. Check Drive or email.` + Drive link

**`intelligence-report/orchestrator.md`** — **UPGRADE** existing:
Replace mock mode with 10-step pipeline:
`pull-ga4 → pull-gsc → pull-rankings → pull-odoo → pull-clarity → competitor-monitor → algorithm-signals → run-20-questions → assemble-report → generate-pdf`

Each step gated: if output missing → Telegram alert and stop. Log errors to `/Logs/[date]-agent-run-log.json`.

**GSC Insights Priority Elevation** (in assemble step):
- Downtrending pages → auto-assign Priority 1 in strategy input
- Uptrending pages → logged as amplification opportunities

---

## Phase 3 — Strategy Layer
> Sprint plan generated automatically from Intelligence Report output.

### 3A — SEO Strategist Subskills
All under `seo-strategist/subskills/`:

| File | What it does |
|------|-------------|
| `read-intelligence-brief.md` | Parse `report-summary.json` — **UPGRADE existing** |
| `identify-attack-vectors.md` | Select 3 attack vectors using Competitor Keyword Position Table as primary lens. Flag competitors who gained 5+ positions; keywords within 3–5 positions of overtaking a competitor |
| `build-content-offensive.md` | Blog posts (2/sprint target), listicles (1/sprint), landing page rewrites (only when triggered by GSC downtrend, competitor new page, or post-cooldown diagnosis) |
| `build-offpage-offensive.md` | Backlink targets (5–8 domains), guest posts (1–2), digital PR (1 data story max), Quora (4 answers), Reddit (3 posts) |
| `build-technical-wins.md` | Top 5 technical fixes ranked by impact/effort ratio — specific actions, not generic |
| `define-metrics.md` | Per action: metric name, current value, target by sprint end, measurement method |
| `build-expert-intelligence-map.md` | Map every sprint decision to a research question finding + expert source |
| `build-history-rationale.md` | Pull from previous sprint Sheets: what worked, didn't, what's repeated and why |
| `write-sprint-plan.md` | Assemble all sections into clean Markdown — 10 required sections |

Sprint plan saved to: `/SEO Automation Engine/Sprint Strategies/[YYYY]/Sprint_[dates].md`

**Sprint Interrupt Protocol:** Qualifying event = confirmed Google core update AND (MozCast > 75 for 3+ days OR top 20 lead page drops > 10 positions in 48h). Telegram alert → PAUSE / CONTINUE / ASSESS. Sprint holds until human replies — no timeout auto-action.

---

### 3B — Product Owner Agent
New directory: `product-owner/`

| File | What it does |
|------|-------------|
| `orchestrator.md` | Drives the validation loop (max 3 iterations before human escalation) |
| `subskills/scan-website.md` | Scans live site at `/solutions/`, `/case-studies/`, `/blog/`, `/docs/`, `/testimonials/`, `/about/` — extracts active offerings, ICP signals, named authors, content gaps. HTTP 200 check on each URL. |
| `subskills/validate-business-alignment.md` | Checks attack vectors against active products/services |
| `subskills/check-competitor-claims.md` | Verifies specific competitor claims |
| `subskills/enrich-with-product-context.md` | Adds product features, case studies, proof points to strategy |
| `subskills/apply-guardrails.md` | Applies CANNOT / FLAG rules from product owner config |
| `subskills/produce-review-output.md` | APPROVED + enrichment notes OR structured revision request |

---

### 3C — Business Validation Agent
New directory: `business-layer/`

| File | What it does |
|------|-------------|
| `orchestrator.md` | Drives quota checks + Telegram human gate |
| `subskills/check-quota-compliance.md` | Every content type within sprint limits; override requires written reason |
| `subskills/check-goal-alignment.md` | Strategy serves annual goals (per-sprint target, seasonality-adjusted) |
| `subskills/check-mql-sql-performance.md` | Previous sprint actuals vs target. Reads `performance_context` from report JSON before flagging underperformance |
| `subskills/check-topic-territory.md` | BiztechCS only: enforce Odoo + AI + Product Engineering topics |
| `subskills/build-tiered-options.md` | Tasks as Priority 1 / Priority 2 / Optional with cost estimates; flag budget overage |

**Telegram message format to human POC:**
```
📋 SPRINT STRATEGY — [Start Date] to [End Date]

ATTACK VECTOR 1: [brief]
ATTACK VECTOR 2: [brief]
ATTACK VECTOR 3: [brief]

PRIORITY 1 TASKS: [list]
PRIORITY 2 TASKS: [list]
OPTIONAL TASKS: [list]

MQL/SQL vs target (last sprint): [actuals vs per-sprint target]
Budget allocation: [per-sprint amount] | Remaining annual: [amount]

📄 Full strategy: [Google Drive link]

Pick tasks, adjust priorities if needed, then reply GO.
```

**Escalation:** No reply 24h → reminder. No reply 48h → fallback POC direct message. Sprint NEVER auto-executes.

---

## Phase 4 — Sprint PM & Task Sheet
> Approved task list → 10-day daily schedule → tracked in Google Sheets.

### 4A — Task Sheet Populator
`task-sheet-populator/orchestrator.md`

On POC GO:
1. Read confirmed task selections
2. Create new Google Sheet: `Sprint [YYYY-MM-DD] to [YYYY-MM-DD]`
3. Columns: Sr, Task Type, Title/Target, Assigned Agent, Status, Started, Completed, Drive Link, Notes
4. All rows start as `Not Started`
5. Share sheet with team
6. GSC downtrending pages → first rows, flagged `Priority: HIGH`

### 4B — Sprint PM Agent
`sprint-pm/orchestrator.md`

**Scheduling logic:**
- P1 tasks → Days 1–4 | P2 tasks → Days 4–7 | Optional → Days 8–10
- Dependencies: minimum 1 day after upstream completes
- Independent tasks run in parallel on the same day

**Default daily schedule:**

| Days | Batch |
|------|-------|
| Day 1 | All technical SEO fixes + all off-page outreach dispatched |
| Days 2–5 | Writing batch (articles ÷ 4 days, Quora/Reddit distributed) |
| Days 3–6 | Editing batch (each piece edited day after written) |
| Days 5–7 | Graphics + HTML preview |
| Days 6–8 | Telegram approval requests |
| Days 8–9 | Publishing (day after approval received) |
| Days 9–10 | Social scheduling + LinkedIn newsletter |

**Overnight cron (launchd):**
- Machine 1: BiztechCS 9PM Mon–Fri | AppJetty 12:30AM Tue–Sat
- Machine 2: PrintXpand 9PM Mon–Fri | CRMJetty 12:30AM Tue–Sat

**Missed trigger:** Tasks remain Pending past 11:59PM → Telegram alert.

**Rollover (blocked tasks only):** Independent blocked → auto-reassign next day + Telegram. Dependent blocked → full chain to POC. No task ever dropped — carries to next sprint as P1.

---

## Phase 5 — Execution Agents
> Content written, edited, approved, published. Outreach sent. Technical fixes applied.

### 5A — Technical SEO Specialist
`technical-seo/orchestrator.md`
- Receives task sheet rows tagged Technical
- Actions: schema fixes, crawl budget, Core Web Vitals, redirect chains
- Change log saved to Drive: `/Logs/[date]-technical-changes.md`
- Updates sheet: Not Started → In Progress → Done

### 5B — Content Pipeline (chained agents)

Build these in order:

**`keyword-research/orchestrator.md`**
- Seeded by Product Owner validated service area map
- Sources: GSC existing rankings, Google Trends (Agent-Browser), AnswerThePublic (Agent-Browser)

**`content-strategist/orchestrator.md`**
- Receives keyword universe + sprint plan content section
- Produces one brief per article: title, primary keyword, secondary keywords, word count, SERP target, competitor being displaced, differentiation angle, internal linking targets
- Saves briefs to Drive: `/Sprint_[dates]/[slug]-brief.md`

**`content-writer/orchestrator.md`**
- Receives content brief
- Steps 1–4: SERP scan → 4-dimension diff → keyword-informed outline → draft
- Saves: `/Content Assets/Sprint_[dates]/[slug]/[slug]-draft.md`

**`content-editor/orchestrator.md`**
- Runs `/humanize` subskill — full humanization pass
- **AI score gate: < 8% hard block** — returns to Writer if failed
- Keyword tally check, E-E-A-T signal check, structural check
- PASS: saves edited draft, triggers Graphics Designer
- FAIL: returns to Content Writer with specific revision scope

**`graphics-designer/orchestrator.md`**
- Receives approved draft + section breakdown + brand guidelines
- Produces GPT-Image-1 / DALL-E 3 image generation prompts per section
- Produces 60-second video storyboard for key pieces
- Naming: `[site]-[content-type]-[slug]-[section].png`
- Saves to `/Content Assets/Sprint_[dates]/[slug]/`

**`html-preview/orchestrator.md`**
- Puppeteer renders branded HTML using website CSS
- Preview includes: full layout, all images, OG metadata, schema validation, mobile layout
- Saved to Drive: `/HTML Previews/Sprint_[dates]/[slug].html`
- This HTML IS the publishing source — what reviewer sees = exactly what publishes

**Content Approval Telegram format:**
```
📄 Content Ready for Review: [Article Title]
Type: [Blog Post / Landing Page]
Target keyword: [keyword]
AI Score: [X]% ✅   Keyword Tally: PASS ✅

🔗 HTML Preview (Drive): [link]
🖼 Images folder (Drive): [link]

Reply: APPROVE / REJECT / REVISE [instructions]
```

**`publishing-agent/orchestrator.md`**
- Reads HTML from exact Drive path
- Publishes to CMS — no reformatting
- Archives to `/Approved/` subfolder
- Updates sheet row → Done
- Triggers Social Media Engine

---

### 5C — Off-Page SEO Pipeline

**`off-page-seo/orchestrator.md`**
- Reads sprint plan off-page section + task sheet rows
- Produces: outreach target list, Reddit/Quora drafts (saved to manual queue files)

**`outreach-manager/orchestrator.md`**
- Sends outreach emails via Odoo email module
- Logs replies; on reply → Telegram flag to human
- Saves log: `/Outreach/Sprint_[dates]/outreach-log.xlsx`

Reddit/Quora queue → Drive → Telegram: `📋 [X] Reddit/Quora posts ready for manual posting. Queue: [Drive link]`

GitHub answers → automated via GitHub API (PAT).

---

### 5D — Page Diagnosis Agent
`page-diagnosis/orchestrator.md`

Triggered only when 90-day cooldown expires (never during cooldown).

Produces Page Diagnosis Brief:
- Full GSC history since fix was applied
- Algorithm overlay: confirmed updates during cooldown window
- Cross-pattern analysis: similar pages recovering or declining?
- Recommended action: specific fix / no-action / further monitoring

SEO Strategist reads this brief before creating any new fix task — receives a diagnosis, not a task.

---

## Phase 6 — Social Media Engine
> Published content → 14-day cross-platform distribution calendar.

`social-media/orchestrator.md` — triggered by Publishing Agent.

**6-step flow:**
1. **Aggregation:** Search Engine Roundtable RSS + Google blog + Moz blog + LinkedIn influencer posts (Agent-Browser) + our published content this sprint
2. **Idea Bank:** Numbered ideas with platform, format, angle, source, thought leadership hook
3. **Idea Approval (Telegram):** Human replies `✅ [n]` / `❌ [n]` / `🔄 [n] [revised angle]`
4. **Post Creation:** Platform-native copy, image brief, hashtag strategy, optimal posting times
5. **Post Approval (Telegram):** Copy + image preview + hashtags + proposed time as package
6. **Scheduling:** Approved → SocialPilot API; Reddit/Quora → manual queue → Telegram alert

**Platform cadence:**

| Platform | Frequency | Method |
|----------|-----------|--------|
| LinkedIn | 4×/week | SocialPilot |
| Facebook | 3×/week | SocialPilot |
| Instagram | 4×/week | SocialPilot |
| Twitter/X | Daily | SocialPilot |
| Reddit | 2×/week | MANUAL |
| Quora | 2×/week | MANUAL |

Cap: max 12 posts/month per website.

---

## Phase 7 — Google Drive + Sheets Infrastructure
> All outputs logged in Drive, all task status in Sheets.

### Drive Folder Structure (provision once per website)
```
/SEO Automation Engine/
├── Intelligence Reports/[YYYY]/
├── Sprint Strategies/[YYYY]/
├── Content Assets/Sprint_[YYYY-MM-DD]/[slug]/
├── HTML Previews/Sprint_[YYYY-MM-DD]/ + /Approved/
├── Outreach/Sprint_[YYYY-MM-DD]/
├── Social/Sprint_[YYYY-MM-DD]/
└── Logs/
```

### Google Sheets Auto-Update
Every execution agent writes back to its sheet row on status change:
- Status flow: `Not Started → In Progress → Pending Review → Approved → Published → Done`
- Date fields auto-populated at each transition
- Drive Link populated when output saved
- Critical milestones (Pending Review, Published) → Telegram ping

Can run in parallel with Phase 4+.

---

## Phase 8 — Continuous Watch Agents
> Always-on monitoring. Start building early, runs parallel to all phases.

### 8A — Algorithm Intelligence Agent
`algorithm-intelligence/orchestrator.md`
- Monitors Search Engine Roundtable + MozCast daily
- Qualifying interrupt: confirmed Google core update AND (MozCast > 75 for 3+ days OR top 20 lead page drops > 10 positions in 48h)
- Pushes rapid-response playbook to SEO Strategist on qualifying event
- Logs all events to Drive for Page Diagnosis Agent

### 8B — Best Practices Monitor
`best-practices-monitor/orchestrator.md`
- Monitors 12 pundits monthly: Neil Patel, Brian Dean, Barry Schwartz, Rand Fishkin, Lily Ray, Kevin Indig, Marie Haynes, Aleyda Solis, John Mueller, Cyrus Shepard, Patrick Stox, Ross Hudgens
- Sources: personal blogs, LinkedIn, X, SEJ, SEL, Moz Blog, Ahrefs Blog, NP Digital Blog, Backlinko
- Monthly digest to SEO Strategist

### 8C — Competitor Watch
`competitor-watch/orchestrator.md`
- Daily: new competitor content (RSS diff), new backlinks
- Weekly: ranking movements
- Instant Telegram alert on high-DA backlink on core keywords
- Bot-blocking cascade: Wayback CDX → Google Cache → RSS → SimilarWeb → Ahrefs free → Google SERP `site:` → LinkedIn/social → manual flag

---

## Full File Build List

### STATUS KEY
- `UPGRADE` — file exists, needs to be rewritten for production
- `BUILD` — does not exist yet

```
intelligence-report/
  orchestrator.md                    UPGRADE
  subskills/pull-ga4-data.md         BUILD
  subskills/pull-gsc-data.md         UPGRADE
  subskills/pull-ranking-data.md     BUILD
  subskills/pull-odoo-leads.md       BUILD
  subskills/pull-clarity-data.md     BUILD
  subskills/competitor-monitor.md    BUILD
  subskills/algorithm-signals.md     BUILD
  subskills/run-20-questions.md      BUILD
  subskills/analyze-data.md          UPGRADE
  subskills/generate-insights.md     UPGRADE
  subskills/assemble-report.md       BUILD
  subskills/generate-pdf.md          BUILD
  subskills/deliver-report.md        BUILD

seo-strategist/
  orchestrator.md                    UPGRADE
  subskills/read-intelligence-brief.md  UPGRADE
  subskills/identify-attack-vectors.md  BUILD
  subskills/build-content-offensive.md  BUILD
  subskills/build-offpage-offensive.md  BUILD
  subskills/build-technical-wins.md     BUILD
  subskills/define-metrics.md           BUILD
  subskills/build-expert-intelligence-map.md  BUILD
  subskills/build-history-rationale.md  BUILD
  subskills/write-sprint-plan.md        BUILD

product-owner/
  orchestrator.md                    BUILD
  subskills/scan-website.md          BUILD
  subskills/validate-business-alignment.md  BUILD
  subskills/check-competitor-claims.md      BUILD
  subskills/enrich-with-product-context.md  BUILD
  subskills/apply-guardrails.md      BUILD
  subskills/produce-review-output.md BUILD

business-layer/
  orchestrator.md                    BUILD
  subskills/check-quota-compliance.md   BUILD
  subskills/check-goal-alignment.md     BUILD
  subskills/check-mql-sql-performance.md BUILD
  subskills/check-topic-territory.md    BUILD
  subskills/build-tiered-options.md     BUILD

task-sheet-populator/
  orchestrator.md                    BUILD

sprint-pm/
  orchestrator.md                    BUILD

technical-seo/
  orchestrator.md                    BUILD

keyword-research/
  orchestrator.md                    BUILD

content-strategist/
  orchestrator.md                    BUILD

content-writer/
  orchestrator.md                    BUILD

content-editor/
  orchestrator.md                    BUILD

graphics-designer/
  orchestrator.md                    BUILD

html-preview/
  orchestrator.md                    BUILD

publishing-agent/
  orchestrator.md                    BUILD

off-page-seo/
  orchestrator.md                    BUILD

outreach-manager/
  orchestrator.md                    BUILD

page-diagnosis/
  orchestrator.md                    BUILD

social-media/
  orchestrator.md                    BUILD

algorithm-intelligence/
  orchestrator.md                    BUILD

best-practices-monitor/
  orchestrator.md                    BUILD

competitor-watch/
  orchestrator.md                    BUILD
```

---

## External Integrations Needed

| Integration | Used By | Auth |
|------------|---------|------|
| GA4 → BigQuery | Intelligence Report | Google Cloud service account |
| GSC → BigQuery | Intelligence Report | Google Cloud service account |
| Odoo XML-RPC | Intelligence Report, Outreach Manager | `ODOO_URL`, `ODOO_DB`, `ODOO_USER`, `ODOO_PASSWORD` |
| Microsoft Clarity REST API | Intelligence Report | API key |
| Ahrefs Webmaster API | Competitor Watch, Off-Page SEO | API key |
| SerpAPI | Competitor Keyword Position Table | API key |
| MozCast API | Algorithm Intelligence | Public (no auth) |
| Google Drive API | All agents | Service account |
| Google Sheets API | Task Sheet Populator + all agents | Service account |
| Puppeteer (Node.js) | HTML Preview, PDF Generator | Local install |
| SocialPilot API | Social Media Engine | API key |
| Telegram Bot API | All approval/alert steps | Bot token + group/chat IDs |
| GitHub API | Off-Page SEO | PAT |
| OpenClaw `message send` | All Telegram comms | OpenClaw CLI |

---

## Per-Website Instantiation Checklist

Run this once per website (4 websites total):

- [ ] Seed `[website]-product-owner-config.md` in OpenClaw memory
- [ ] Seed `[website]-business-config.md` in OpenClaw memory
- [ ] Verify E-E-A-T infrastructure live on website (named author bios published)
- [ ] Confirm BigQuery datasets linked (GA4 export + GSC export active)
- [ ] Set competitor domain list for this website
- [ ] Set `TELEGRAM_GROUP_ID` and `TELEGRAM_APPROVAL_CHAT_ID`
- [ ] Set primary POC Telegram ID + fallback POC Telegram ID
- [ ] Set Machine assignment (Machine 1 or Machine 2) + trigger times
- [ ] Confirm CMS API access for Publishing Agent
- [ ] Confirm Odoo XML-RPC access (`crm.lead` + email module)
- [ ] Confirm SocialPilot account connected
- [ ] Provision Drive folder structure for this website
- [ ] Run Product Owner website scan manually — verify outputs
- [ ] Run mock Intelligence Report end-to-end — verify PDF output
- [ ] Seed Sprint 1 with baseline data (first sprint History section = baseline run)
- [ ] Set launchd cron (`1st + 16th of month, 6AM`) on assigned Mac Mini

---

## Core Rules — Never Break These

1. **Human GO is always required.** No sprint auto-executes. No content auto-publishes. Every significant action is Telegram-gated.
2. **Strategy freeze on GO.** Once Business Layer approves, strategy is frozen. POC task selection is task-level only — no scope changes.
3. **No generic strategies.** Every tactic must trace to a research question finding or a verified prior sprint outcome.
4. **No silent failures.** If a data pull fails, the report notes the gap. Nothing fails quietly.
5. **Page Diagnosis before any re-fix.** Cooldown exists for a reason. Never assign a new fix task to a page in cooldown.
6. **AI score < 8% hard block.** Content Editor must reject and return to Writer if score fails.
7. **Sprint interrupt = hold.** No timeout auto-action. Sprint holds until human explicitly replies.
8. **Content pipeline calls existing humanization system.** Do not rebuild it. Content Writer + Content Editor call into the existing pipeline.
9. **Ranking check calls existing client system.** `pull-ranking-data.md` reads its output file. Do not rebuild ranking monitoring.
