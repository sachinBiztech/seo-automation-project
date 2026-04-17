# SEO Automation Engine — Implementation Plan
**Based on:** Concept from Parth v3.0 | **Date:** April 2026
**Framework:** OpenClaw | **Runtime:** Mac Mini (always-on) | **Approvals:** Telegram only

---

## Current State

The project has a partial mock prototype:
- `intelligence-report/` — orchestrator + 3 subskills (gsc pull, analyze, generate-insights)
- `seo-strategist/` — orchestrator + 1 subskill (read-intelligence-brief)
- `mock-data/` — GA4, GSC, Odoo, competitor, rankings JSON files
- `outputs/` — report artifacts from a demo run

Everything else is not yet built.

---

## Current Pipeline Workflow (Live Reference — April 2026)

All 5 pipelines are built and running in mock mode. The end-to-end flow:

```
[1st/16th 6AM cron]
        │
        ▼
run-intelligence-pipeline.js   (node)
  └─ openclaw agent --agent intelligence-report
  └─ 11 subskills → report-summary.json + intelligence-report.md
        │
        ▼
  📱 Telegram: "Approve Intelligence Report?"
        │ (human clicks ✅)
        ▼
run-pipeline.js   (node)
  └─ openclaw agent --agent seo-strategist
  └─ 6 subskills → sprint-plan.json + sprint-tasks-[id].json
        │
        ▼
  📱 Telegram: "Approve Sprint Plan?"
        │ (human clicks ✅)
        ▼
[daily cron] sprint-pm.js   (pure Node — no agent)
  └─ calculates today's sprint day
  └─ for each Content task today →
        │
        ▼
     run-content-pipeline.js   (node)
       └─ openclaw agent --agent content-pipeline
       └─ 5 subskills + editor loop → preview-[slug].html
             │
             ▼
       📱 Telegram: "Approve Article?"
             │ (human clicks ✅)
             ▼
     run-publishing-agent.js   (node)
       └─ openclaw agent --agent publishing-agent
       └─ publishes to CMS → task status = Done
```

**3 human approval gates (all via Telegram):** after Intelligence Report, after Sprint Plan, after each article.

---

### Pipeline 1 — Intelligence Report
**Runner:** `node run-intelligence-pipeline.js` | **Timeout:** 30 min
**Orchestrator:** `intelligence-report/orchestrator.md` | **Model:** claude-sonnet-4-6

| Step | Subskill | Reads | Writes | On Fail |
|------|----------|-------|--------|---------|
| 1 | `pull-gsc-data` | `mock-data/gsc-mock.json` | `gsc-findings.json` | STOP |
| 2 | `pull-ga4-data` | `mock-data/ga4-mock.json` | `ga4-findings.json` | STOP |
| 3 | `pull-ranking-data` | `mock-data/ranking-mock.json` | `ranking-findings.json` | STOP |
| 4 | `pull-odoo-leads` | `mock-data/odoo-mock.json` | `odoo-findings.json` | STOP |
| 4.5 | `pull-clarity-data` | `mock-data/clarity-mock.json` | `clarity-findings.json` | WARNING |
| 5 | `competitor-monitor` | `mock-data/competitor-mock.json` | `competitor-findings.json` | WARNING |
| 6 | `algorithm-signals` | `mock-data/algorithm-mock.json` | `algorithm-findings.json` | WARNING |
| 7 | `analyze-data` | All 6 findings files | `analysis-findings.json` | STOP |
| 8 | `run-20-questions` | `analysis-findings.json` + `gsc-findings.json` | `research-findings.json` | STOP |
| 9a | `generate-insights` | `analysis-findings.json` + `gsc-findings.json` | `insights.json` | STOP |
| 9b | `assemble-report` | All findings + `insights.json` | `report-summary.json`, `intelligence-report.md`, `.html` | STOP |
| 10 | `generate-pdf` | `intelligence-report.html` | `generate-pdf-status.json` | WARNING (html fallback) |
| 11 | `deliver-report` | `report-summary.json` + pdf/html | `report-approval.json` (status: `pending`) | STOP |

**Gate:** Telegram message → human approves → `report-approval.json` status = `approved`

---

### Pipeline 2 — SEO Strategist (Sprint Plan)
**Runner:** `node run-pipeline.js` | **Timeout:** 30 min
**Pre-check:** `report-approval.json` must be `status: "approved"`
**Orchestrator:** `seo-strategist/orchestrator.md` | **Model:** claude-opus-4-6

| Step | Subskill | Reads | Writes | On Fail |
|------|----------|-------|--------|---------|
| 1 | `parse-intelligence-brief` | `report-summary.json` | `intelligence-brief-parsed.json` | STOP |
| 2 | `identify-attack-vectors` | brief + competitor/ranking/analysis findings | `attack-vectors.json` | STOP |
| 3a | `build-content-offensive` | `attack-vectors.json` + brief + research | `content-plan.json` | WARNING |
| 3b | `build-technical-offensive` | `attack-vectors.json` + brief + research | `technical-plan.json` | WARNING |
| 3c | `build-offpage-offensive` | `attack-vectors.json` + brief + research | `offpage-plan.json` | WARNING (all 3 fail = STOP) |
| 4 | `assemble-sprint-plan` | All 3 plans + brief | `sprint-plan.json`, `sprint-plan.md`, `sprint-plan.html` | STOP |
| 5 | `generate-sprint-pdf` | `sprint-plan.html` | `generate-sprint-pdf-status.json` | WARNING (html fallback) |
| 6 | `deliver-sprint-plan` | sprint-plan files | `sprint-approval.json` (status: `pending`) | STOP |

**Gate:** Telegram with approval buttons → human clicks ✅ → `sprint-approval.json` status = `approved`

---

### Pipeline 3 — Sprint PM (Daily Orchestrator)
**Runner:** `node sprint-pm.js` | **Trigger:** daily overnight cron
**Pre-check:** `sprint-approval.json` must be `status: "approved"` | **No OpenClaw agent — pure Node**

| Step | What it does |
|------|-------------|
| 1 | Verify `sprint-approval.json` is approved |
| 2 | Calculate today's sprint day (1–15) from `sprint_start` |
| 3 | Find today's tasks from `sprint-tasks-[sprint_id].json` |
| 4 | Find missed/overdue tasks from past days |
| 5 | Reassign missed tasks to next available day + Telegram alert |
| 6 | Check dependencies — content-editor waits for paired content-writer to be `Completed` |
| 7 | Mark today's tasks `In Progress`; call `run-content-pipeline.js` for each Content task |
| 8 | Send daily Telegram summary (Triggered / Held / Reassigned) |
| 9 | Write updated `sprint-tasks-[sprint_id].json` + CSV |
| 10 | Write `sprint-pm-log-[date].json` |

---

### Pipeline 4 — Content Pipeline (Per Article)
**Runner:** `node run-content-pipeline.js` | **Timeout:** 15 min | **Called by:** sprint-pm.js
**Orchestrator:** `content-pipeline/agent/agent.md` | **Model:** claude-opus-4-6

| Step | Agent | Reads | Writes | On Fail |
|------|-------|-------|--------|---------|
| Setup | Node runner | `sprint-tasks-[sprint_id].json` | `pipeline-context-[task_id].json` | STOP |
| 1 | `content-strategist` | `pipeline-context-[task_id].json` | `content-brief-[slug].json` | STOP |
| 2 | `content-writer` | `content-brief-[slug].json` + keyword universe | `draft-[slug].md` | STOP |
| 3a | `content-editor` Pass 1 | `draft-[slug].md` + brief | `edited-draft-[slug].md` (PASS) OR `revision-brief-[slug].md` (FAIL) | Conditional |
| 3b | `content-writer` revision | `revision-brief-[slug].md` | updated `draft-[slug].md` | Continue |
| 3c | `content-editor` Pass 2 | revised draft | `edited-draft-[slug].md` OR escalate Telegram | Escalate if 2× fail |
| 4 | `graphics-designer` | `edited-draft-[slug].md` + brief | `image-prompts-[slug].json` | WARNING (placeholders) |
| 5 | `html-preview-generator` | draft + image prompts | `preview-[slug].html` + `.pdf` | STOP |
| Final | agent writes result | all above | `pipeline-result-[task_id].json` (status: `complete`) | STOP |
| Cleanup | Node runner | `pipeline-result-[task_id].json` | `content-approval-[sprint_id].json` + Telegram buttons | — |

**Gate:** Telegram article preview → human approves → `content-approval.json` status = `approved`

---

### Pipeline 5 — Publishing Agent
**Runner:** `node run-publishing-agent.js` | **Timeout:** 5 min
**Pre-check:** `content-approval-[sprint_id].json` must be `status: "approved"`
**Orchestrator:** `publishing-agent/orchestrator.md` | **Model:** claude-haiku-4-5-20251001

| Step | What it does |
|------|-------------|
| 1 | Verify content approval |
| 2 | Publish `preview-[slug].html` to CMS (MOCK: logs record; PROD: calls CMS API) |
| 3 | Verify publication success |
| 4 | Archive HTML to `outputs/approved/` |
| 5 | Update `sprint-tasks-[sprint_id].json` — task status → `Done` |
| 6 | Trigger social media engine queue |
| 7 | Send Telegram confirmation |

---

### Key Output Files (Inter-Agent Handoffs)

| File | Written by | Read by |
|------|-----------|---------|
| `outputs/report-summary.json` | `assemble-report` | `run-pipeline.js` (pre-check), `parse-intelligence-brief` |
| `outputs/report-approval.json` | `deliver-report` | `run-pipeline.js` (gate) |
| `outputs/sprint-plan.json` | `assemble-sprint-plan` | `deliver-sprint-plan` |
| `outputs/sprint-approval.json` | `deliver-sprint-plan` / Telegram bridge | `sprint-pm.js` (gate) |
| `outputs/sprint-tasks-[id].json` | `sprint-pm.js` | `run-content-pipeline.js`, `run-publishing-agent.js` |
| `outputs/pipeline-context-[id].json` | `run-content-pipeline.js` | `content-pipeline/agent/agent.md` |
| `outputs/pipeline-result-[id].json` | content-pipeline agent | `run-content-pipeline.js` |
| `outputs/content-approval-[id].json` | `run-content-pipeline.js` | `run-publishing-agent.js` (gate) |

---

## Architecture Summary (Target State)

```
launchd cron (1st + 16th of month, 6AM)
  └── Intelligence Report Orchestrator
        ├── Data pulls (GA4/BigQuery, GSC/BigQuery, Odoo, Clarity, Rankings, Competitors, Algo signals, 20 Questions)
        ├── PDF + JSON summary → Google Drive
        ├── Odoo email → stakeholders
        └── Telegram alert → "Report ready"
              │
              ▼
        SEO Strategist Agent
        └── Reads JSON summary → produces sprint plan (15-day)
              │
              ▼
        Product Owner Agent
        └── Validates strategy vs business config → APPROVED or REVISION
              │
              ▼
        Business Validation Agent
        └── Quota check, goal alignment, MQL/SQL check, budget tiers
              │
              ▼
        Human POC (Telegram) — GO / task selection
              │
              ▼
        Task Sheet Populator → Google Sheet sprint tracker
              │
              ▼
        Sprint PM Agent (daily 9PM/12:30AM cron)
        └── Triggers overnight execution agents
              ├── Technical SEO Specialist
              ├── Content pipeline: Strategist → Writer → Editor → Graphics → HTML Preview → Approval → Publisher
              ├── Off-Page: Orchestrator → Outreach Manager (Odoo email)
              └── Social Media Engine → SocialPilot API + manual queues
```

**Four websites:** BiztechCS, PrintXpand, CRMJetty, AppJetty
**Two Mac Minis:**
- Machine 1: BiztechCS (9PM) + AppJetty (12:30AM)
- Machine 2: PrintXpand (9PM) + CRMJetty (12:30AM)

---

## Implementation Phases

### Phase 1 — Foundation & Data Layer
*Goal: Real data in, structured outputs out. No execution yet.*

#### 1.1 — Config Files (one-time setup per website)
Create two config files per website stored in OpenClaw memory:

**`[website]-product-owner-config.md`** (per website)
- Site identity (name, domain, CMS type)
- Active product/service scope
- Ideal Customer Profile (ICP)
- Competitor positioning + what we can/cannot say
- Named authors (E-E-A-T) — Uttam, Nandeep for BiztechCS (titles/bios pending)
- Active sprint priorities this quarter
- Messaging guardrails (CAN / CANNOT / FLAG for human)

**`[website]-business-config.md`** (per website, annual)
- Annual business goals (leads, MQLs, SQLs, revenue) — auto-divided by 26 sprints
- Annual SEO budget — divided by 26 sprints
- Seasonality weights (Q1–Q4 %)
- Content quotas per sprint (hardcoded per the concept)
- Primary POC + Fallback POC Telegram user IDs
- Newsletter rules
- Social media cap (12 posts/month)

**Content quotas reference:**
| Website | Blog | Listicles | Free BL | Paid BL | Quora | Reddit | LinkedIn NL |
|---------|------|-----------|---------|---------|-------|--------|------------|
| BiztechCS | max 10 | max 3 | max 100 | max 20 | max 5 | max 5 | min 1/sprint |
| PrintXpand | max 4 | max 3 | max 100 | max 20 | max 5 | max 5 | min 1/sprint |
| CRMJetty | max 4 | max 3 | max 100 | max 20 | max 5 | max 5 | min 1/sprint |
| AppJetty | max 2 | max 3 | max 100 | max 20 | max 5 | max 5 | max 1/2 sprints |

#### 1.2 — Data Pull Subskills (replace mocks with real API calls)

Build or upgrade each subskill under `intelligence-report/subskills/`:

| Subskill | API / Method | Key outputs |
|----------|-------------|-------------|
| `pull-ga4-data.md` | BigQuery SQL — GA4 native export | Sessions, conversions, organic share — 15d/90d/180d windows |
| `pull-gsc-data.md` | BigQuery SQL — GSC native export | Top 1000 queries, positions, CTR, impressions — 15d/90d/180d |
| `pull-ranking-data.md` | Client's in-built ranking flow output file | Top 50 keyword positions, MoM, QoQ |
| `pull-odoo-leads.md` | Odoo XML-RPC (`crm.lead`) | Leads/MQLs/SQLs MTD/QTD/YTD, source breakdown, landing page attribution |
| `pull-clarity-data.md` | Clarity REST API v0 | Rage clicks, dead clicks, scroll depth per page |
| `competitor-monitor.md` | Sitemap diff + RSS diff + Wayback CDX + Ahrefs | New pages, new posts, content changes, new backlinks |
| `algorithm-signals.md` | Search Engine Roundtable (Agent-Browser) + MozCast API | Confirmed updates, volatility score |
| `run-20-questions.md` | Claude Opus + web research | 20 structured findings + action recommendations |

**Data Quality Gate:** Before assembling the report, run completeness checks per source. CRITICAL failures (GA4, GSC, Odoo, Rankings) release report with gap noted. WARNING failures (Clarity, competitor scrape, algorithm signals) omit section but continue. No silent failures.

**GSC Regional segmentation:** North America, Europe, Middle East & Africa, Australia & NZ, Rest of World — configured per website.

**Top 20 organic lead pages:** Source is Odoo CRM landing page reports (12-month minimum lookback). Re-queried each cycle. Each page tracked: GSC position (90d trend + 180d baseline + 15d delta), impressions, CTR, Odoo lead contribution.

#### 1.3 — Page Cooldown Tracker
Implement cooldown tracking as part of the Google Sheet sprint tracker:
- Fixed pages enter 90-day cooldown on completion
- Cooldown expiry date logged in sheet
- During cooldown: page monitored passively, cannot receive new tasks
- On cooldown expiry: route to Page Diagnosis Agent before any new fix
- GSC Insights downtrending during cooldown → "In Cooldown — Watch List" section, not Priority 1

#### 1.4 — Previous Sprint Fix Verification
At each cycle start, Intelligence Report Orchestrator:
1. Reads previous sprint sheet, extracts rows where Task Type = fix/technical and Status = Done
2. Checks current GSC + Insights data for each page
3. Produces verdict table (Recovered / In Progress / Not Recovered) in the Intelligence Report

---

### Phase 2 — Intelligence Report (Production)
*Goal: Full PDF report generated and delivered automatically.*

#### 2.1 — Assemble Report Subskill
`intelligence-report/subskills/assemble-report.md`

Combines all data pull outputs into:
- Structured JSON summary (`report-summary.json`) — machine-readable input for SEO Strategist
- `performance_context` field in JSON — plain-language explanation of any MQL/SQL variance from target (so Business Layer doesn't misread algorithmic events as strategy failures)
- Formatted HTML report following the PDF sections:
  1. Cover
  2. Executive Summary (1 page, numbers only)
  3. Lead Flow Dashboard (MTD/QTD/YTD tables)
  4. Rankings & Traffic Snapshot
  5. Algorithm Update Status
  6. Competitor Watch
  7. Best Practices & Recommendations (20 questions condensed)
  8. Appendix — raw data tables

**Competitor Keyword Position Table** — cumulative, never reset. Maintained every cycle. Strategy layer reads last 6 months rolling to prevent bloat. Stored in Drive alongside report.

#### 2.2 — PDF Generator
`intelligence-report/subskills/generate-pdf.md`

- Puppeteer (Node.js) renders HTML template to PDF
- Filename: `[SiteName]-SEO-Intelligence-Report_[YYYY]_[MM-DD].pdf`
- Drive save: `/SEO Automation Engine/Intelligence Reports/[YYYY]/[filename].pdf`
- On PDF failure: save HTML version, Telegram alert with HTML link

#### 2.3 — Report Delivery
`intelligence-report/subskills/deliver-report.md`

- Odoo Marketing/Email module sends PDF to stakeholder distribution list
- Telegram alert to `TELEGRAM_GROUP_ID`: `📊 Intelligence Report ready — [date]. Check Drive or email.`
- Includes Drive link in alert

#### 2.4 — GSC Insights Priority Elevation
In the assemble step:
1. Extract all pages flagged downtrending by GSC Insights
2. Auto-assign Priority 1 to these pages in the sprint strategy input
3. For each: pull current position, impressions, CTR, last-modified date, page type
4. Pass as locked Priority 1 inputs to SEO Strategist
5. Uptrending pages logged as amplification opportunities

#### 2.5 — Upgrade Intelligence Report Orchestrator
`intelligence-report/orchestrator.md` — replace mock-mode with full pipeline:
- 10-step sequence (pull-ga4 → pull-gsc → pull-rankings → pull-odoo → pull-clarity → competitor-monitor → algorithm-signals → run-20-questions → assemble-report → generate-pdf)
- Each step gated: if output missing, Telegram alert and stop
- Error logged to `/Logs/[date]-agent-run-log.json`

---

### Phase 3 — Strategy Layer
*Goal: Sprint plan produced automatically from Intelligence Report output.*

#### 3.1 — SEO Strategist Subskills
Complete the subskill set under `seo-strategist/subskills/`:

| Subskill | What it does |
|----------|-------------|
| `read-intelligence-brief.md` | Parses `report-summary.json` — extracts opportunities, competitor moves, algo findings, lead trends *(partially exists)* |
| `identify-attack-vectors.md` | Selects 3 attack vectors using Competitor Keyword Position Table as primary lens. Mandatory pre-read before any vectors are selected. Flags competitors who gained 5+ positions; keywords within 3–5 positions of overtaking a competitor. |
| `build-content-offensive.md` | Blog posts (target: 2/sprint), listicles (1/sprint), service/landing page rewrites (triggered only by GSC downtrend, competitor new page, or post-cooldown diagnosis). Full 7-step article creation pipeline spec per piece. |
| `build-offpage-offensive.md` | Backlink targets (5–8 domains), guest posts (1–2), digital PR (1 data story max), Quora (4 answers), Reddit (3 posts/comments), LinkedIn long-form (1–2) |
| `build-technical-wins.md` | Top 5 technical fixes ranked by impact/effort ratio. Each fix: specific action (not generic — exact change required) |
| `define-metrics.md` | Per action: metric name, current value, target by sprint end, measurement method |
| `build-expert-intelligence-map.md` | Maps every sprint decision to a research question finding + expert source (Q-number, expert name, specific finding applied) |
| `build-history-rationale.md` | Pulls from previous sprint Sheets: what worked, what didn't, what's being repeated and why |
| `write-sprint-plan.md` | Assembles all sections into clean Markdown — all 10 required sections |

**Sprint plan output:** `Sprint_[YYYY-MM-DD]_to_[YYYY-MM-DD].md` → `/SEO Automation Engine/Sprint Strategies/[YYYY]/`

**Sprint Interrupt Protocol:** Algorithm Intelligence detects qualifying event (confirmed Google core update AND MozCast > 75 for 3+ days OR top 20 lead page drops > 10 positions in 48h). Telegram alert to POC: PAUSE / CONTINUE / ASSESS. No timeout auto-action — sprint holds until reply.

#### 3.2 — Product Owner Agent
`product-owner/orchestrator.md` + subskills:

| Subskill | What it does |
|----------|-------------|
| `scan-website.md` | Scans live site at `/solutions/`, `/case-studies/`, `/blog/`, `/docs/`, `/testimonials/`, `/about/` — extracts active offerings, ICP signals, named authors, content gaps. Runs at instantiation + start of each cycle if last scan > 15 days ago. HTTP 200 check on each URL — flag on failure. |
| `validate-business-alignment.md` | Checks attack vectors against active products/services |
| `check-competitor-claims.md` | Verifies specific competitor claims (Agent-Browser where needed) |
| `enrich-with-product-context.md` | Adds product features, case studies, proof points to strategy |
| `apply-guardrails.md` | Applies CANNOT say / FLAG for review rules from config |
| `produce-review-output.md` | APPROVED + enrichment notes OR structured revision request |

**Reform loop cap:** Max 3 iterations. On failure: human escalation via Telegram with full revision history. Human SME makes final call.

#### 3.3 — Business Validation Agent
`business-layer/orchestrator.md` + subskills:

| Subskill | What it does |
|----------|-------------|
| `check-quota-compliance.md` | Every content type within sprint limits. Override accepted only with written reason. |
| `check-goal-alignment.md` | Does strategy serve annual goals (per-sprint target slice, seasonality-adjusted)? |
| `check-mql-sql-performance.md` | Previous sprint actuals vs target. Reads `performance_context` from Intelligence Report JSON before flagging underperformance. |
| `check-topic-territory.md` | BiztechCS only: enforces Odoo + AI + Product Engineering. Other sites: qty only. |
| `build-tiered-options.md` | Presents tasks as Priority 1 / Priority 2 / Optional with cost estimates per tier. Budget overage flag if POC selects over allocation. |

**Human POC Gate — Telegram message format:**
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

**Escalation:** No reply in 24h → reminder. No reply in 48h → direct message to fallback POC. Sprint never auto-executes without human GO.

**Quota override audit:** Every 13 sprints (quarterly). If any quota overridden in >50% of sprints, Telegram flag to POC with option to revise the annual limit or keep.

---

### Phase 4 — Sprint PM & Task Sheet
*Goal: Approved task list distributed into a 10-day daily schedule and tracked in Google Sheets.*

#### 4.1 — Task Sheet Populator
`task-sheet-populator/orchestrator.md`

On POC GO:
1. Reads POC's confirmed task selections
2. Creates new Google Sheet: `Sprint [YYYY-MM-DD] to [YYYY-MM-DD]`
3. Populates all rows with columns: Sr, Task Type, Title/Target, Assigned Agent, Status, Started, Completed, Drive Link, Notes
4. Status starts as `Not Started`
5. Shares sheet with team

GSC Insights downtrending pages: created as first rows, flagged `Priority: HIGH`.

#### 4.2 — Sprint PM Agent
`sprint-pm/orchestrator.md`

**Scheduling logic:**
- Total tasks per type ÷ available days = tasks per day
- P1 → Days 1–4 | P2 → Days 4–7 | Optional → Days 8–10
- Dependencies: scheduled minimum 1 day after upstream completes
- Independent tasks share a day and run in parallel

**Default daily schedule:**
| Day | Batch |
|-----|-------|
| Day 1 | All technical SEO fixes + all off-page outreach dispatched |
| Days 2–5 | Writing batch (articles ÷ 4 days, Quora/Reddit distributed evenly) |
| Days 3–6 | Editing batch (each piece edited day after written) |
| Days 5–7 | Graphics + HTML preview |
| Days 6–8 | Telegram approval requests |
| Days 8–9 | Publishing (day after approval received) |
| Days 9–10 | Social scheduling + LinkedIn newsletter |

**Overnight trigger (launchd cron):**
- Machine 1 BiztechCS: 9PM Mon–Fri | AppJetty: 12:30AM Tue–Sat
- Machine 2 PrintXpand: 9PM Mon–Fri | CRMJetty: 12:30AM Tue–Sat

**Missed trigger detection:** If tasks remain Pending past 11:59PM → Telegram alert.

**Rollover (blocked tasks only):** Independent blocked → auto-reassign to next day + Telegram. Dependent blocked → full dependency chain sent to POC. No task is ever dropped — carries to next sprint as Priority 1 if unresolved.

---

### Phase 5 — Execution Agents
*Goal: Content created, reviewed, published. Outreach sent. Technical fixes applied.*

#### 5.1 — Technical SEO Specialist
`technical-seo/orchestrator.md`
- Receives task sheet rows tagged Technical
- Actions: schema markup fixes, crawl budget optimization, Core Web Vitals improvements, redirect chain cleanup
- Writes change log to Drive: `/Logs/[date]-technical-changes.md`
- Updates sheet row: Not Started → In Progress → Done

#### 5.2 — Content Pipeline (chained agents)

**Content Strategist** (`content-strategist/orchestrator.md`)
- Receives keyword universe from Keyword Research Analyst + sprint plan content section
- Produces one content brief per article: title, primary keyword, secondary keywords, word count, SERP target, competitor being displaced, differentiation angle, internal linking targets
- Writes briefs to Drive: `/Sprint_[dates]/[slug]-brief.md`

**Keyword Research Analyst** (`keyword-research/orchestrator.md`)
- Seeded by Product Owner's validated service area map
- Sources: GSC existing rankings, Google Trends (Agent-Browser), AnswerThePublic (Agent-Browser)
- Produces keyword universes for approved topics only

**Content Writer** (`content-writer/orchestrator.md`)
- Receives content brief
- Writes draft against 7-step pipeline steps 1–4: SERP scan → 4-dimension diff → keyword-informed outline → draft
- Saves: `/Content Assets/Sprint_[dates]/[slug]/[slug]-draft.md`

**Content Editor** (`content-editor/orchestrator.md`)
- Runs `/humanize` subskill — full humanization pass
- AI score gate: **< 8% for all articles** (hard block — returns to Writer if failed)
- Keyword tally check
- E-E-A-T signal check (author attribution, experience signals, citations)
- Structural check: opening hook, CTAs, internal links, heading schema
- On PASS: saves edited draft, triggers Graphics Designer
- On FAIL: returns to Content Writer with specific revision scope

**Graphics Designer** (`graphics-designer/orchestrator.md`)
- Receives approved edited draft + section breakdown + brand guidelines
- Produces GPT-Image-1 / DALL-E 3 compatible image generation prompts per section
- Produces video storyboard (60-second explainer outline) for key pieces
- Naming: `[site]-[content-type]-[slug]-[section].png`
- Saves to: `/Content Assets/Sprint_[dates]/[slug]/`
- Triggers HTML Preview Generator after images generated

**HTML Preview Generator** (`html-preview/orchestrator.md`)
- Puppeteer renders branded HTML template using website CSS
- Preview includes: full layout with brand fonts/colors, all images embedded, OG metadata, schema validation summary, mobile layout
- Saved to Drive: `/HTML Previews/Sprint_[dates]/[slug].html`
- This file IS the publishing source — what reviewer sees is exactly what publishes

**Content Approval Flow (Telegram):**
```
📄 Content Ready for Review: [Article Title]
Type: [Blog Post / Landing Page]
Target keyword: [keyword]
AI Score: [X]% ✅   Keyword Tally: PASS ✅

🔗 HTML Preview (Drive): [link]
🖼 Images folder (Drive): [link]

Reply: APPROVE / REJECT / REVISE [instructions]
```
- APPROVE → Publishing Agent reads same HTML file, publishes, archives to `/Approved/`
- REJECT → Content Editor + Graphics cycle repeats from failure point
- REVISE → Targeted edits only; updated HTML overwrites same Drive path; Telegram: "same preview link updated"

**Publishing Agent** (`publishing-agent/orchestrator.md`)
- Reads HTML from exact Drive path
- Publishes to CMS — no reformatting
- Archives HTML to `/Approved/` subfolder
- Updates Sheet row: Published → Done
- Triggers Social Media Engine

#### 5.3 — Off-Page SEO Pipeline

**Off-Page SEO Orchestrator** (`off-page-seo/orchestrator.md`)
- Reads sprint plan off-page section + task sheet rows
- Produces: outreach target list (backlinks + guest posts), Reddit/Quora drafts (saved to manual queue files)
- Hands off to Outreach Manager

**Outreach Manager** (`outreach-manager/orchestrator.md`)
- Sends outreach emails via Odoo email module
- Logs replies
- On reply: Telegram flag to human
- Saves outreach log: `/Outreach/Sprint_[dates]/outreach-log.xlsx`

**Reddit/Quora queue:** Saved to Drive → Telegram alert to human: `📋 [X] Reddit/Quora posts ready for manual posting. Queue: [Drive link]`

**GitHub answers:** Automated via GitHub API (PAT).

#### 5.4 — Page Diagnosis Agent
`page-diagnosis/orchestrator.md`

Triggered when a page's 90-day cooldown expires and still needs a fix. Never triggered during cooldown.

Produces a Page Diagnosis Brief containing:
- Full GSC history (position, impressions, CTR) for the page since the fix was applied
- Algorithm overlay: were there confirmed algorithm updates during the cooldown window? (from Algorithm Intelligence log)
- Cross-pattern analysis: are other pages in the same content cluster or with similar technical profiles recovering or declining?
- Recommended action: specific fix, no-action, or further monitoring period

SEO Strategist reads this brief before creating any fix task. The strategist receives a diagnosis, not a task.

---

### Phase 6 — Social Media Engine
*Goal: Journalistic thought leadership distributed across all platforms on a 14-day calendar.*

`social-media/orchestrator.md` — triggered after Publishing Agent confirms publication.

**14-day calendar flow:**

**Step 1 — Aggregation:** Search Engine Roundtable RSS + Google blog RSS + Moz blog RSS + LinkedIn influencer posts (Agent-Browser) + our published content this sprint.

**Step 2 — Idea Bank Generation:** Numbered ideas. Per idea: platform, format, angle, source, thought leadership hook, why it wins.

**Step 3 — Idea Approval (Telegram):** Full idea bank posted. Human responds `✅ [n]` / `❌ [n]` / `🔄 [n] [revised angle]`.

**Step 4 — Post Creation per approved idea:**
- Full platform-native copy (character limits enforced)
- Image/graphic brief for Graphics Designer
- Hashtag strategy (researched, not generic)
- Optimal posting time by timezone (IST/EST for LinkedIn; evenings for Instagram)

**Step 5 — Post Approval (Telegram):** Copy + image preview + hashtags + proposed time sent as package.

**Step 6 — Scheduling:**
- Approved posts: SocialPilot API
- Reddit/Quora: manual queue files → Telegram alert to human

**Platform cadence:**
| Platform | Frequency | Formats | Method |
|----------|-----------|---------|--------|
| LinkedIn | 4×/week | Text post, Carousel PDF, Poll, Short article | SocialPilot |
| Facebook | 3×/week | Reel script, Image post, Link post | SocialPilot |
| Instagram | 4×/week | Carousel, Reel script, Story | SocialPilot |
| Twitter/X | Daily | Thread 5–7 tweets, single take, commentary | SocialPilot |
| Reddit | 2×/week | Long-form discussion, value-first answer | MANUAL |
| Quora | 2×/week | Detailed expert answer | MANUAL |

**Cap:** Max 12 posts/month per website.

**Every published article triggers cross-platform distribution:** LinkedIn article (canonical back to site), Twitter/X thread (5 key insights), Facebook link post, Instagram key stat carousel, Reddit value-first answer (link in comments), Quora expert answer, Medium cross-post (manual, low priority).

---

### Phase 7 — Google Drive + Sheets Infrastructure
*Goal: All outputs logged in Drive, all task status in Sheets, real-time team visibility.*

#### 7.1 — Drive Folder Structure
Provision once per website:
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

#### 7.2 — Google Sheets Auto-Update
Every execution agent writes back to its row on each status change via Google Sheets API:
- Status transitions: `Not Started → In Progress → Pending Review → Approved → Published → Done`
- Date fields auto-populated at transition
- Drive Link populated when output file saved
- Critical milestones (Pending Review, Published) trigger Telegram ping

---

### Phase 8 — Continuous Watch Agents
*Goal: Always-on monitoring that feeds the Intelligence Report and triggers sprint interrupts.*

#### 8.1 — Algorithm Intelligence Agent
`algorithm-intelligence/orchestrator.md`
- Monitors Search Engine Roundtable + MozCast daily
- Qualifying interrupt: confirmed Google core update AND (MozCast > 75 for 3+ days OR top 20 lead page drops > 10 positions in 48h)
- Pushes rapid-response playbook to SEO Strategist on qualifying event
- Logs all algorithm events to Drive for Page Diagnosis Agent cross-pattern analysis

#### 8.2 — Best Practices Monitor
`best-practices-monitor/orchestrator.md`
- Monitors 12 named pundits monthly: Neil Patel, Brian Dean, Barry Schwartz, Rand Fishkin, Lily Ray, Kevin Indig, Marie Haynes, Aleyda Solis, John Mueller, Cyrus Shepard, Patrick Stox, Ross Hudgens
- Sources: personal blogs, LinkedIn, X, SEJ, SEL, Moz Blog, Ahrefs Blog, NP Digital Blog, Backlinko
- Monthly digest to SEO Strategist

#### 8.3 — Competitor Watch
`competitor-watch/orchestrator.md`
- Daily: new competitor content (RSS diff), new backlinks
- Weekly: ranking movements
- Instant Telegram alert on high-DA backlink on core keywords
- Bot-blocking fail-safe cascade: Wayback CDX → Google Cache → RSS → SimilarWeb → Ahrefs free → Google SERP `site:` query → LinkedIn/social → manual flag

---

## Dependency Map (Build Order)

```
Phase 1 (Config + Data Layer)
  └── Phase 2 (Intelligence Report)
        └── Phase 3 (Strategy Layer)
              └── Phase 4 (Sprint PM + Task Sheet)
                    └── Phase 5 (Execution Agents)
                          └── Phase 6 (Social Media Engine)

Phase 7 (Drive + Sheets) — parallel to Phase 4+
Phase 8 (Watch Agents) — parallel to all, start early
```

---

## What to Build Per Agent (File List)

```
intelligence-report/
  orchestrator.md              ← UPGRADE (replace mock with real pipeline)
  subskills/
    pull-ga4-data.md           ← BUILD
    pull-gsc-data.md           ← UPGRADE (exists, mock → real)
    pull-ranking-data.md       ← BUILD
    pull-odoo-leads.md         ← BUILD
    pull-clarity-data.md       ← BUILD
    competitor-monitor.md      ← BUILD
    algorithm-signals.md       ← BUILD
    run-20-questions.md        ← BUILD
    analyze-data.md            ← UPGRADE (exists, partial)
    generate-insights.md       ← UPGRADE (exists, partial)
    assemble-report.md         ← BUILD
    generate-pdf.md            ← BUILD
    deliver-report.md          ← BUILD

seo-strategist/
  orchestrator.md              ← UPGRADE
  subskills/
    read-intelligence-brief.md ← UPGRADE (exists, partial)
    identify-attack-vectors.md ← BUILD
    build-content-offensive.md ← BUILD
    build-offpage-offensive.md ← BUILD
    build-technical-wins.md    ← BUILD
    define-metrics.md          ← BUILD
    build-expert-intelligence-map.md ← BUILD
    build-history-rationale.md ← BUILD
    write-sprint-plan.md       ← BUILD

product-owner/
  orchestrator.md              ← BUILD
  [website]-product-owner-config.md ← SEED per website
  subskills/
    scan-website.md            ← BUILD
    validate-business-alignment.md ← BUILD
    check-competitor-claims.md ← BUILD
    enrich-with-product-context.md ← BUILD
    apply-guardrails.md        ← BUILD
    produce-review-output.md   ← BUILD

business-layer/
  orchestrator.md              ← BUILD
  [website]-business-config.md ← SEED per website
  subskills/
    check-quota-compliance.md  ← BUILD
    check-goal-alignment.md    ← BUILD
    check-mql-sql-performance.md ← BUILD
    check-topic-territory.md   ← BUILD
    build-tiered-options.md    ← BUILD

task-sheet-populator/
  orchestrator.md              ← BUILD

sprint-pm/
  orchestrator.md              ← BUILD

technical-seo/
  orchestrator.md              ← BUILD

keyword-research/
  orchestrator.md              ← BUILD

content-strategist/
  orchestrator.md              ← BUILD

content-writer/
  orchestrator.md              ← BUILD

content-editor/
  orchestrator.md              ← BUILD

graphics-designer/
  orchestrator.md              ← BUILD

html-preview/
  orchestrator.md              ← BUILD

publishing-agent/
  orchestrator.md              ← BUILD

off-page-seo/
  orchestrator.md              ← BUILD

outreach-manager/
  orchestrator.md              ← BUILD

page-diagnosis/
  orchestrator.md              ← BUILD

social-media/
  orchestrator.md              ← BUILD

algorithm-intelligence/
  orchestrator.md              ← BUILD

best-practices-monitor/
  orchestrator.md              ← BUILD

competitor-watch/
  orchestrator.md              ← BUILD
```

---

## Key External Integrations Required

| Integration | Used by | Auth method |
|------------|---------|-------------|
| GA4 → BigQuery | Intelligence Report | Google Cloud service account |
| GSC → BigQuery | Intelligence Report | Google Cloud service account |
| Odoo XML-RPC | Intelligence Report, Outreach Manager | `ODOO_URL`, `ODOO_DB`, `ODOO_USER`, `ODOO_PASSWORD` |
| Microsoft Clarity API | Intelligence Report | API key |
| Ahrefs Webmaster API | Competitor Watch, Off-Page SEO | API key |
| SerpAPI | Competitor Keyword Position Table | API key |
| MozCast API | Algorithm Intelligence | Public (no auth) |
| Google Drive API | All agents (read/write) | Service account |
| Google Sheets API | Task Sheet Populator, all agents | Service account |
| Puppeteer (Node.js) | HTML Preview, PDF Generator | Local install |
| SocialPilot API | Social Media Engine | API key |
| Telegram Bot API | All approval/alert steps | Bot token + group/chat IDs |
| GitHub API | Off-Page SEO (GitHub answers) | PAT |
| OpenClaw `message send` | All Telegram comms | OpenClaw CLI |

---

## Instantiation Checklist (per new website)

- [ ] Seed `[website]-product-owner-config.md` — ICP, services, guardrails, named authors
- [ ] Seed `[website]-business-config.md` — annual goals, budget, seasonality, quotas, POC details
- [ ] Verify E-E-A-T infrastructure in place on website (named authors + bios live)
- [ ] Confirm BigQuery datasets linked (GA4 export + GSC export)
- [ ] Set competitor domain list
- [ ] Set `TELEGRAM_GROUP_ID` and `TELEGRAM_APPROVAL_CHAT_ID` for this website
- [ ] Set primary POC Telegram ID + fallback POC Telegram ID
- [ ] Set Machine assignment (Machine 1 or Machine 2) + trigger times
- [ ] Confirm CMS API access for Publishing Agent
- [ ] Confirm Odoo XML-RPC access (`crm.lead`, email module)
- [ ] Confirm SocialPilot account connected for this website
- [ ] Set Drive folder structure for this website
- [ ] Run first Product Owner website scan manually and verify outputs
- [ ] Run mock Intelligence Report end-to-end and verify PDF output
- [ ] Seed Sprint 1 with baseline data (first sprint History-Backed Rationale section = baseline run)
- [ ] Set launchd cron (`1st + 16th of month, 6AM`) on assigned Mac Mini

---

## Notes

- **Site-agnostic framework.** Only the Product Owner config and Business config vary between websites. All agents are the same code, different memory.
- **Human GO is always required.** No sprint auto-executes. No content auto-publishes. Every significant action is Telegram-gated.
- **Strategy freeze on GO.** Once Business Layer approves, strategy is frozen. POC task selection is task-level only.
- **No generic strategies.** Every tactic must trace to either a research question finding or a verified prior sprint outcome. The SEO Strategist is explicitly trained to reject generic recommendations.
- **Content generation + humanization pipeline already exists** (per concept). This plan does not rebuild it — the Content Writer and Content Editor agents call into the existing pipeline.
- **Ranking check flow already exists** (client's in-built system). The `pull-ranking-data.md` subskill reads its output file — it does not rebuild ranking monitoring.
