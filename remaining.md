# SEO Automation Engine — Done vs Remaining
**Audited against:** `Concept from Parth.md` (v3.0, March 2026)
**Last updated:** 2026-04-17

---

## Legend
- ✅ Done — built and tested end-to-end (mock mode)
- 🟡 Partial — built but incomplete or untested
- ❌ Missing — not built at all
- 🔧 Wire — built, needs real API to run

---

## Phase 1 — Intelligence Report

### What's done
- ✅ 10-step pipeline: pull-ga4 → pull-gsc → pull-rankings → pull-odoo → pull-clarity → competitor-monitor → algorithm-signals → run-20-questions → assemble-report → generate-pdf
- ✅ Data Quality Gate (CRITICAL vs WARNING failure types)
- ✅ PDF generation via Puppeteer
- ✅ Telegram delivery with Approve/Revise/Reject gate

### What's missing
| # | Feature | Why it matters |
|---|---------|---------------|
| 1 | **Performance lookback 15d / 90d / 180d windows** | Concept requires 3 windows; mock data is flat. All ranking/traffic verdicts are based on 90-day trend, not cycle delta. |
| 2 | **GSC Regional Segmentation** (North America / Europe / ME&A / ANZ as separate tables) | Required for understanding whether a ranking win/drop is regional or global. |
| 3 | **Competitor Keyword Position Table** (Q10 output — cumulative table, never reset, 6-month rolling active view) | This is the primary lens for attack vector selection every sprint. Does not exist anywhere in the current pipeline. |
| 4 | **Source Attribution Coverage Check** (Odoo attribution < 80% → flag landing page section) | Prevents strategy built on incomplete lead data. |
| 5 | **Previous Sprint Fix Verification** (read previous sprint sheet → Recovered / In Progress / Not Recovered verdict table) | Closes the feedback loop. Every fix must be verified next cycle. |
| 6 | **"In Cooldown — Watch List"** section in report (pages in cooldown flagged but not actioned) | Required companion to cooldown system. |
| 7 | **Odoo email delivery** of PDF to stakeholder distribution list | Concept requires report goes via Odoo email, not just Telegram. |
| 8 | **Drive save** of PDF to `/SEO Automation Engine/Intelligence Reports/[YYYY]/` | Nothing saves to Drive — no Drive API. |

---

## Phase 2 — Sprint Strategy

### What's done
- ✅ Parse Intelligence Brief
- ✅ Identify Attack Vectors (3 vectors)
- ✅ Build Content Offensive (blogs + listicles)
- ✅ Build Technical Offensive
- ✅ Build Off-Page Offensive (backlinks, outreach)
- ✅ Assemble Sprint Plan (JSON + Markdown + HTML)
- ✅ Generate Sprint PDF
- ✅ Deliver to Telegram with Approve/Revise/Reject buttons

### Sprint Plan — Missing Sections
Concept requires **10 sections**. Currently assembled: ~5.

| Section | Status | Notes |
|---------|--------|-------|
| 1 — Sprint Period | ✅ | |
| 2 — Top 3 Attack Vectors | 🟡 | Missing Competitor Position Table cross-reference |
| 3 — Content Offensive (3a blogs, 3b listicles, 3c service page rewrites) | 🟡 | 7-step article pipeline spec not fully enforced in brief |
| 4 — Off-Page Offensive | 🟡 | 4a backlinks partial; 4b guest posts partial; **4c Digital PR missing; 4d Quora (4 named answers) missing; 4e Reddit (3 named posts) missing; 4f LinkedIn Long-Form Articles missing** |
| 5 — Technical Wins | ✅ | |
| **6 — Social Amplification** | ❌ | Per content piece: LinkedIn/X/IG/Reddit/Quora cross-platform plan |
| **7 — AI Overview Targets** | ❌ | Per query: current status + content approach to get cited |
| **8 — Metrics to Move** | ❌ | Subskill `define-metrics.md` exists but is NOT called in orchestrator |
| **9 — Expert Intelligence Applied** | ❌ | Subskill `build-expert-intelligence-map.md` exists but is NOT called in orchestrator |
| **10 — History-Backed Rationale** | ❌ | Subskill `build-history-rationale.md` exists but is NOT called in orchestrator |

### Other strategist gaps
| # | Feature | Notes |
|---|---------|-------|
| 1 | Competitor Keyword Position Table read before Step 2 | Attack vectors must be cross-referenced against this table — it doesn't exist yet |
| 2 | Sprint Interrupt Protocol (Algorithm Intelligence → PAUSE / CONTINUE / ASSESS) | Built in concept, callback-listener doesn't handle this action type |
| 3 | Sprint plan saved to Drive | `/Sprint Strategies/[YYYY]/Sprint_[dates].md` — no Drive API |

---

## Phase 3 — Product Owner + Business Layer

### What's done
- ✅ Product Owner: scan-website, validate-business-alignment, check-competitor-claims, enrich-with-product-context, apply-guardrails, produce-review-output
- ✅ Business Layer: quota compliance, goal alignment, MQL/SQL check, topic territory (BiztechCS), tiered options
- ✅ BiztechCS product-owner-config.md and business-config.md seeded
- ✅ Human POC Telegram gate (Proceed / Adjust)

### What's missing
| # | Feature | Notes |
|---|---------|-------|
| 1 | **Product Owner 3-iteration loop cap** with Telegram escalation to human SME | No loop counter. A misconfigured config file can create an infinite reform loop. |
| 2 | **Quarterly Quota Override Audit** (>50% overrides of any content type → self-correcting flag to POC) | The quota system as built has no self-correction mechanism. |
| 3 | **24h reminder / 48h fallback POC escalation** (no POC reply after GO sent) | Sprint currently waits indefinitely. Hard requirement from concept: sprint never auto-executes, but escalation must trigger. |
| 4 | **Budget-tiered cost totals** (P1 total cost / P2 total cost / optional total cost + overage % flag) | Partial — tiers exist but per-tier cost totals not calculated. |
| 5 | PrintXpand / CRMJetty / AppJetty configs | Only BiztechCS seeded. 3 sites unbuilt. |

---

## Phase 4 — Sprint PM + Task Sheet

### What's done
- ✅ Sprint PM Day 1: technical SEO + off-page outreach dispatched
- ✅ Task Sheet Populator: creates sheet structure with all task rows
- ✅ Status columns: Status, Started, Completed, Drive Link, Notes

### What's missing
| # | Feature | Notes |
|---|---------|-------|
| 1 | **Sprint PM Days 2–10 end-to-end** (writing → editing → graphics → approval → publish → social) | Day 2 content pipeline trigger not yet run end-to-end |
| 2 | **Google Sheets API** | Sheet is created as a local CSV / JSON structure only. No real Google Sheet. |
| 3 | **PM Sheet columns**: Assigned Day, Assigned Date, Dependency | Only Status/Started/Completed exist. The 3 scheduling columns from concept are missing. |
| 4 | **Page Cooldown tracking** (`Status: Cooldown` row + 90-day expiry date per page) | No cooldown system exists anywhere. |
| 5 | **Missed trigger detection** (tasks Pending past 11:59 PM → Telegram alert) | No rollover-check cron exists. |
| 6 | **Sprint Calendar alignment** (always starts Monday; POC gives GO on Sunday) | Not enforced in PM scheduling logic. |

---

## Phase 5 — Execution Agents

### What's done
- ✅ Technical SEO agent
- ✅ Off-Page SEO Orchestrator + Outreach Manager (8 emails, mock)
- ✅ Content pipeline: keyword-research → content-strategist → content-writer → content-editor → graphics-designer → html-preview
- ✅ Content Editor AI score < 8% hard block
- ✅ Content approval Telegram gate (APPROVE / REJECT)
- 🔧 Publishing agent (built, no CMS API)
- 🔧 Social media agent (built, no SocialPilot API)

### What's missing
| # | Feature | Notes |
|---|---------|-------|
| 1 | **Content approval REVISE flow** (REVISE [instructions] → targeted edits → same Drive link updated → re-review Telegram) | Only APPROVE / REJECT implemented. REVISE is the third concept option. |
| 2 | **Publish → Social auto-trigger** (every published article automatically triggers cross-platform distribution plan) | Not wired as automatic trigger. Social is manually invoked. |
| 3 | **Per-article social distribution plan** (LinkedIn Article + X thread + FB + IG + manual Reddit/Quora/Medium queue) | Not part of current publishing flow. |
| 4 | **GitHub answers via GitHub API** (automated posting, PAT) | Off-page channel in concept — not built. |
| 5 | **Digital PR data story** (1/sprint max; full pitch to 3-5 named outlets via Odoo email) | Off-page channel in concept — not built. |
| 6 | **LinkedIn Long-Form Articles** (1-2/sprint, separate from social posts, with canonical back to site) | Off-page channel in concept — not built. |
| 7 | **Guest Post full pipeline** (Content Writer produces draft → Outreach Manager delivers via Odoo email as formatted Doc) | Partially wired; Odoo email not connected. |
| 8 | **Keyword Research seeded by Product Owner service area map** | Keyword Research agent exists but is not explicitly triggered by Product Owner output. |
| 9 | **Page Diagnosis Agent triggered on cooldown expiry** (not during sprint — after 90-day window clears) | Agent built (`page-diagnosis/orchestrator.md`), but no cooldown tracker to trigger it. |
| 10 | **Content saved to Drive** (`/Content Assets/Sprint_[dates]/[slug]/`) | No Drive API. |
| 11 | **HTML Preview saved to Drive** (review + publish source — what reviewer sees = exactly what publishes) | No Drive API. |

---

## Phase 6 — Social Media Engine

### What's done
- 🟡 Aggregation step (mock: fictional industry news items)
- 🟡 Idea Bank generation
- 🟡 Idea Approval (Telegram) — in orchestrator, but callback-listener doesn't handle this approval type
- 🟡 Platform-native post creation per channel
- 🟡 Post Approval (Telegram)
- 🔧 SocialPilot API scheduling (not wired)
- 🔧 Reddit/Quora manual queue → Drive (no Drive API)

### What's missing
| # | Feature | Notes |
|---|---------|-------|
| 1 | **Idea Approval callback routing** (✅ [n] / ❌ [n] / 🔄 [n] format) | callback-listener handles sprint approval but not social idea approval responses |
| 2 | **14-day structured social calendar** (not just idea bank — full calendar with dates per post per platform) | Currently generates ideas, not a dated calendar |
| 3 | **Per-published-article automatic distribution** (triggered by Publishing Agent on every publish) | No wiring between Publishing Agent and Social Media Engine |
| 4 | **Platform caps enforced** (max 12 posts/month per website; LinkedIn 4×/week, FB 3×/week, etc.) | Cap logic not implemented |

---

## Phase 7 — Google Drive + Google Sheets Infrastructure

### What's done
- ❌ Nothing. This entire layer is unbuilt.

### What's missing (full list)
| Item | Needed by |
|------|-----------|
| Google Drive API (service account auth) | Every agent that saves outputs |
| Drive folder structure provisioned per website | All agents |
| Intelligence Reports saved to Drive | Intelligence Report |
| Sprint Strategies saved to Drive | SEO Strategist |
| Content Assets (drafts, edited, images) saved to Drive | Content pipeline |
| HTML Previews saved to Drive (review = publish source) | HTML Preview, Publishing Agent |
| Outreach files (backlinks, guest posts, reddit/quora queues) to Drive | Off-Page, Outreach Manager |
| Social assets and queues to Drive | Social Media Engine |
| Agent run logs saved to Drive `/Logs/` | All agents |
| Google Sheets API (service account auth) | Task Sheet Populator |
| Sheet auto-created on Business Layer approve | Task Sheet Populator |
| Every agent writes status back to its sheet row | All execution agents |
| Cooldown status + expiry date tracked in sheet | Sprint PM |
| Drive Links populated in sheet at each output save | All agents |
| Critical milestone Telegram pings from sheet (Pending Review, Published) | All execution agents |

---

## Phase 8 — Continuous Watch Agents

### What's done
- 🟡 `algorithm-intelligence/orchestrator.md` — built, not running continuously
- 🟡 `best-practices-monitor/orchestrator.md` — built, not running
- 🟡 `competitor-watch/orchestrator.md` — built, not running

### What's missing
| # | Feature | Notes |
|---|---------|-------|
| 1 | Algorithm Intelligence running on daily cron | Needs launchd plist |
| 2 | Sprint Interrupt triggered by Algorithm Intelligence qualifying event | Not wired to callback-listener or sprint PM |
| 3 | Best Practices Monitor monthly digest fed to SEO Strategist | No feed mechanism |
| 4 | Competitor Watch daily/weekly cron | Needs launchd plist |
| 5 | Competitor Watch instant Telegram alert on high-DA backlink | Alert logic not implemented |

---

## Production API Wiring (all mock → real)

| Integration | Used By | Status |
|------------|---------|--------|
| GA4 → BigQuery SQL | Intelligence Report | 🔧 Wire |
| GSC → BigQuery SQL | Intelligence Report | 🔧 Wire |
| Odoo XML-RPC (`crm.lead`) | Intelligence Report, Outreach Manager | 🔧 Wire |
| Microsoft Clarity REST API | Intelligence Report | 🔧 Wire |
| Ahrefs Webmaster API | Competitor Watch, Off-Page SEO | 🔧 Wire |
| SerpAPI | Competitor Keyword Position Table | 🔧 Wire |
| MozCast API | Algorithm Intelligence | 🔧 Wire |
| Google Drive API | All agents | ❌ Not built |
| Google Sheets API | Task Sheet + all agents | ❌ Not built |
| CMS Publish API | Publishing Agent | 🔧 Wire |
| SocialPilot API | Social Media Engine | 🔧 Wire |
| Odoo Email Module | Intelligence Report, Outreach Manager | 🔧 Wire |
| GitHub API (PAT) | Off-Page SEO | ❌ Not built |

---

## Operational (not code, but required for production)

| Item | Status |
|------|--------|
| launchd cron on Machine 1 (BiztechCS 9PM + AppJetty 12:30AM) | ❌ |
| launchd cron on Machine 2 (PrintXpand 9PM + CRMJetty 12:30AM) | ❌ |
| Intelligence Report cron (1st + 16th at 6AM) | ❌ |
| Sprint PM daily overnight cron | ❌ |
| Algorithm Intelligence daily cron | ❌ |
| PrintXpand product-owner-config.md | ❌ |
| CRMJetty product-owner-config.md | ❌ |
| AppJetty product-owner-config.md | ❌ |
| PrintXpand business-config.md | ❌ |
| CRMJetty business-config.md | ❌ |
| AppJetty business-config.md | ❌ |
| E-E-A-T author bios verified live on all 4 sites | ❌ (BiztechCS TBD) |
| BigQuery datasets linked (GA4 + GSC export active per site) | ❌ |

---

## Recommended Build Order (mock → production)

### Immediate (close the mock loop)
1. **Run Sprint PM Day 2** → content pipeline fires → Telegram approve → publish → social triggers
   — this closes the last untested mock loop

### Next (fix structural gaps in mock)
2. **Add missing sprint plan sections 6–10** (wire the 3 orphaned subskills: define-metrics, build-expert-intelligence-map, build-history-rationale; add Social Amplification and AI Overview sections)
3. **Competitor Keyword Position Table** — add as Q10 output in Intelligence Report + add as mandatory Step 0 input in Strategist before attack vector selection
4. **Content approval REVISE flow** — third option beyond APPROVE/REJECT

### Production (real data)
5. **Google Drive API + Sheets API** — unblocks every other production feature
6. **Previous Sprint Fix Verification + Page Cooldown tracking** — closes feedback loop per concept
7. **Real API wiring** (GA4/GSC BigQuery, Odoo XML-RPC, SerpAPI, Ahrefs, Clarity, SocialPilot, CMS)
8. **24h/48h POC escalation + missed trigger detection** — operational reliability
9. **Continuous Watch Agents on launchd cron** — Algorithm Intelligence + Best Practices + Competitor Watch
10. **Multi-site configs** (PrintXpand, CRMJetty, AppJetty) + Machine 2 deployment
