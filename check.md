# SEO Automation Engine — Status & Checklist
**Last updated:** 2026-04-27
**Pipeline:** BiztechCS (mock mode) — full stack built, Phase 0 validation next

---

## Pipeline Build Status

### Mock Pipeline — All Stages

| Stage | Agent / File | Status | Output Location |
|-------|-------------|--------|-----------------|
| Intelligence Report | `intelligence-report/orchestrator.md` | ✅ Built & tested | `outputs/intelligence-report/` |
| SEO Strategist | `seo-strategist/orchestrator.md` | ✅ Built & tested | `outputs/seo-strategist/` |
| Sprint Approval Gate | `callback-listener.js` + `approval-bridge.js` | ✅ Built & tested | — |
| Feedback Loop (Revise/Reject) | `review-sprint-feedback/orchestrator.md` | ✅ Built & tested | `outputs/seo-strategist/` |
| Post-Approval (PO + BL) | `post-approval/orchestrator.md` | ✅ Built & tested | `outputs/post-approval/` |
| Task Sheet Populator | `task-sheet-populator/orchestrator.md` | ✅ Built (no Sheets API) | `outputs/sprint-pm/` |
| Sprint PM | `sprint-pm/orchestrator.md` | ✅ Built (Day 1 tested) | `outputs/sprint-pm/` |
| Content Pipeline | `content-pipeline/orchestrator.md` | ✅ Built (not yet run end-to-end) | `outputs/content-pipeline/` |
| Publishing Agent | `publishing-agent/orchestrator.md` | ✅ Built (mock, no CMS API) | `outputs/publishing-agent/` |
| Social Media Engine | `social-media/orchestrator.md` | ✅ Built (mock, no SocialPilot) | `outputs/social-media/` |

---

## Output Directory Structure

```
outputs/
├── intelligence-report/    ← IR pipeline (gsc, ga4, rankings, odoo, insights, report-summary, PDF)
├── seo-strategist/         ← Sprint plan, attack vectors, PDF, approval files
├── post-approval/          ← PO review, BL checks, tiered options
├── sprint-pm/              ← sprint-tasks JSON/CSV, sprint PM logs, technical briefs
├── content-pipeline/       ← brief, draft, edited-draft, image-prompts, preview, approval
├── publishing-agent/       ← publish log, social-media trigger, approved/ archive
├── social-media/           ← social posts, manual queue, outreach log
└── logs/                   ← callback-listener, content-approval-bridge, algorithm-event-log

old-outputs/                ← Backup of previous run (85 files, 2026-04-27)
```

---

## Mock Data Available

| File | What it represents |
|------|--------------------|
| `mock-data/gsc-mock.json` | 20 GSC keywords, 90d/180d positions, AI Overview status, GSC Insights flags |
| `mock-data/ga4-mock.json` | Sessions, conversions, organic share — 15d/90d/180d windows |
| `mock-data/rankings-mock.json` | Top 50 keyword positions, MoM/QoQ delta |
| `mock-data/odoo-leads-mock.json` | Leads, MQLs, SQLs — MTD/QTD/YTD + 20 lead pages |
| `mock-data/clarity-mock.json` | Rage clicks, dead clicks, scroll depth |
| `mock-data/competitor-mock.json` | 5 competitors, new pages, backlinks, job signals |
| `mock-data/competitor-position-table-mock.json` | 30 keywords, our pos vs each competitor, attack windows |
| `mock-data/algorithm-signals-mock.json` | MozCast score, confirmed updates, sprint interrupt flag |
| `mock-data/previous-sprint-results-mock.json` | Prior sprint outcomes for Section 10 history rationale |

---

## Run Sequence (openclaw agents)

Run these orchestrators in order. Each feeds the next.

```
1. intelligence-report/orchestrator.md
   → writes outputs/intelligence-report/report-summary.json

2. seo-strategist/orchestrator.md
   → reads report-summary.json
   → writes outputs/seo-strategist/sprint-plan.json + PDF

3. [Telegram] Approve sprint → approval-bridge.js fires
   → triggers post-approval/orchestrator.md

4. post-approval/orchestrator.md
   → writes outputs/post-approval/tiered-sprint-options.json + product-owner-review

5. task-sheet-populator/orchestrator.md
   → writes outputs/sprint-pm/sprint-tasks-[sprint_id].json

6. sprint-pm/orchestrator.md
   → reads sprint-tasks JSON, dispatches Day 1 agents

7. content-pipeline/orchestrator.md  (for each content task)
   → writes outputs/content-pipeline/preview-[slug].html

8. [Telegram] Approve content → content-approval-bridge.js fires
   → triggers publishing-agent/orchestrator.md

9. publishing-agent/orchestrator.md
   → writes outputs/publishing-agent/publish-log + social-media-trigger

10. social-media/orchestrator.md
    → writes outputs/social-media/social-posts + manual-queue
```

**Background processes required before running (for Telegram callbacks):**
```bash
node callback-listener.js &          # sprint approve/revise/reject
node content-approval-bridge.js &    # content approve/revise/reject
```

---

## What's Remaining (per Concept from Parth)

### Phase 0 — Validate full mock loop (NEXT)
- [ ] Run intelligence-report → seo-strategist → post-approval → sprint-pm → content-pipeline → publish → social end-to-end with new output paths
- [ ] Confirm all 8 output subdirectories receive files
- [ ] Confirm Telegram approval chain works at each gate

### Phase 1 — Sprint Plan completeness
- [ ] Verify all 10 sections in sprint plan (Sections 6 Social Amplification + 7 AI Overview Targets exist in HTML)
- [ ] metrics-plan.json wired into seo-strategist orchestrator

### Phase 2 — Competitor Position Table
- [ ] Q10 in run-20-questions writes competitor-position-table.json to `outputs/intelligence-report/`
- [ ] identify-attack-vectors reads it as primary lens before selecting attack vectors

### Phase 3 — Keyword Research → Content Pipeline
- [ ] keyword-universe-[slug].json produced by keyword-research before content-strategist runs
- [ ] content-strategist reads keyword universe for brief

### Phase 4 — Content Approval REVISE flow
- [ ] content-approval-bridge.js handles REVISE [instructions] (not just APPROVE/REJECT)
- [ ] html-preview/orchestrator.md Telegram message includes REVISE option

### Phase 5 — Sprint PM fixes
- [ ] Content pipeline spawning on Day 2+ (explicit taskType = Content check)
- [ ] sprint-pm-dispatch-[date].json written BEFORE agent spawn
- [ ] Missed trigger detection (tasks not started past 11 PM → Telegram alert)
- [ ] sprint-tasks schema: add assignedDay, assignedDate, dependency columns

### Phase 6 — Business Layer reliability
- [ ] PO loop cap at 3 iterations → human escalation
- [ ] 24h/48h POC non-response escalation (check-poc-timeout.js)

### Phase 7 — Google Drive + Sheets API
- [ ] drive-helper.js utility (upload, createSheet, updateRow)
- [ ] task-sheet-populator → real Google Sheet
- [ ] Reports/sprint plans saved to Drive, Drive URL in Telegram messages
- [ ] Execution agents update sheet row on status change

### Phase 8 — Real API wiring
- [ ] GA4 → BigQuery SQL
- [ ] GSC → BigQuery SQL
- [ ] Odoo XML-RPC (leads, MQLs, SQLs, landing pages)
- [ ] Microsoft Clarity REST API
- [ ] SerpAPI (competitor keyword position table)
- [ ] Ahrefs Webmaster (backlink monitoring)
- [ ] CMS publish API (WordPress or Odoo Blog)
- [ ] SocialPilot API (FB, IG, LinkedIn, X scheduling)

### Per-website expansion
- [ ] AppJetty product-owner-config.md + business-config.md
- [ ] PrintXpand product-owner-config.md + business-config.md
- [ ] CRMJetty product-owner-config.md + business-config.md

### Concepts from Parth not yet implemented
- [ ] Page Cooldown Tracker (90-day post-fix lock, sheet status = Cooldown)
- [ ] Previous Sprint Fix Verification (reads prior sprint sheet, checks GSC verdict per page)
- [ ] Page Diagnosis Agent trigger (on cooldown expiry, before strategist sees the page)
- [ ] Sprint Interrupt Protocol (confirmed core update + MozCast > 75 → halt sprint, Telegram)
- [ ] Daily 6 PM cron (rollover check + blocked task dependency alerts)
- [ ] Odoo email delivery for Intelligence Report (stakeholder distribution list)
- [ ] GSC regional segmentation (North America / Europe / MEA / ANZ)
