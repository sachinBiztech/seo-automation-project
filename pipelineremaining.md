# Pipeline Remaining — BiztechCS SEO Automation
**Audited:** 2026-04-27 | **Reference:** Concept from Parth.md

---

## ✅ Done Correctly (MOCK — full pipeline flow proven end-to-end)

| Stage | Status | Output |
|-------|--------|--------|
| Intelligence Report (10 steps) | ✅ | PDF + all JSON findings |
| SEO Strategist | ✅ | Sprint plan PDF, attack vectors, all 8 sections |
| Product Owner Review (6 steps) | ✅ | Alignment, guardrails, enriched plan |
| Business Layer (5 steps) | ✅ | Quota check, tiered options, post-approval |
| Task Sheet Populator | ✅ | CSV with all tasks (correct structure) |
| Sprint PM Day 1 | ✅ | Technical briefs generated |
| Content Pipeline — Task 5 | ✅ | 5-step pipeline, HTML preview |
| Telegram approval gate | ✅ | Button tap received + processed |
| Publishing Agent (Node.js) | ✅ | Publish log, HTML archived, trigger written |
| Social Media Engine (Node.js) | ✅ | 4 posts + 2 manual queue (Reddit/Quora) |

---

## ⚠️ Done but Broken / Wrong

### 1. sprint-tasks JSON corrupted
The content-approval-bridge overwrote `sprint-tasks-biztechcs_sprint_2026-04-27.json` with the approval format (`items` array). The CSV has the correct full task list but the JSON — which all Node.js runners read — only has one entry. Every runner that calls `data.tasks.find(...)` will fail on future tasks.
**Fix:** Restore JSON from CSV. Fix content-approval-bridge to write to its own file, not overwrite sprint-tasks.

### 2. Word count: 680 words
Parth spec: 2,000–3,500 words for blog posts. The content agent wrote a very short draft. The editor fallback (copy draft → edited-draft) didn't fix this. Content quality gate is not enforcing length.
**Fix:** Add minimum word count check in `run-content-pipeline.js` before editor passes content — reject under 1,500 words and force re-run of writer step.

### 3. Social post scheduled times wrong
IST conversion is off — LinkedIn shows `2026-04-27T22:00` (past time, today). The UTC offset math in `generateMockContent()` is incorrect.
**Fix:** Use proper `next weekday` date calculation and set IST times directly without UTC offset arithmetic.

### 4. Content tasks 6 and 7 not run
Sprint PM ran Day 1 (technical only). Content tasks (Days 2–5 per Parth schedule) haven't triggered. Only Task 5 ran manually.
**Fix:** Run `node run-sprint-pm.js --sprint-id biztechcs_sprint_2026-04-27 --day 2` and subsequent days to trigger content pipeline for remaining tasks.

### 5. Off-page tasks not executed
`off-page-seo` orchestrator was never triggered by sprint-pm. Outreach packages exist from an old run but the real off-page pipeline (backlink targets, guest post pitches, Quora/Reddit queue per-article) wasn't dispatched from the sprint task sheet.
**Fix:** Sprint PM needs to trigger `run-off-page-seo.js` for Day 1 off-page tasks.

---

## ❌ Not Built Yet (from Parth concept)

### External API Integrations (all currently MOCK data)
- **Google BigQuery** — GA4 + GSC real data pull (currently reads mock JSON files)
- **Odoo XML-RPC** — real lead/MQL/SQL/landing-page data (`crm.lead` model)
- **Microsoft Clarity API** — heatmap, rage clicks, scroll depth (Clarity API v0)
- **SerpAPI / Agent-Browser SERP** — real SERP scan + competitor position table per keyword
- **Ahrefs Webmaster API** — backlink data for competitor monitoring
- **Competitor sitemap diff** — real Wayback CDX API calls + RSS diff (currently mock competitor findings)
- **In-built ranking flow** — client's existing keyword ranking system output (format TBD)
- **Google PageSpeed Insights API** — Core Web Vitals (LCP, INP, CLS) per page

### Google Drive Integration
- Intelligence Report PDF not saved to Drive (`/SEO Automation Engine/Intelligence Reports/YYYY/`)
- Sprint plan not saved to Drive (`/SEO Automation Engine/Sprint Strategies/YYYY/`)
- HTML previews not saved to Drive (`/SEO Automation Engine/HTML Previews/Sprint_.../[slug].html`)
- Content assets (images) not saved to Drive (`/SEO Automation Engine/Content Assets/Sprint_.../[slug]/`)
- Approval Telegram notifications link to local file paths — should link to Google Drive direct URLs
- Publishing Agent reads HTML from local path — should read from Drive path

### Google Sheets API
- Sprint task sheet is local JSON + CSV only — Sheets API not wired
- No auto-share with team after POC GO
- Sprint PM status updates (In Progress → Done / Blocked / Rolled Over) not reflected in Sheets
- Assigned Day, Assigned Date, Dependency columns only in CSV — not live in Sheets
- Quarterly quota override audit report not wired to Sheets

### CMS Publish (WordPress REST API)
- Publishing Agent writes `published_mock: true` only — WordPress REST API not wired
- No actual CMS upload (title, slug, author, categories, tags, publish date)
- HTTP GET verification of published URL (200 + title match) not done
- Image upload to CMS per-article subfolder not done

### Email / Outreach (Odoo Email Module)
- Outreach emails drafted locally in JSON — Odoo email module not wired
- Guest post pitches sitting in output JSON, not delivered to contacts
- Digital PR pitches not sent to media outlets
- Backlink outreach emails not dispatched

### SocialPilot API
- Social posts exist in local JSON queue — SocialPilot API not called
- LinkedIn, Facebook, Instagram, Twitter/X posts NOT actually scheduled
- Cap enforcement (12 posts/month) not queried against real SocialPilot account data

### LinkedIn Newsletter
- Not built — Parth spec: **min 1 per sprint** for BiztechCS
- Focus: Odoo, Product Engineering, AI
- Style: Journalistic, research-driven, logical, decision-maker oriented
- Needs: separate `run-linkedin-newsletter.js` + agent + Telegram approval gate

### Always-On Agents (not running)
- **Algorithm Intelligence** — daily Google update monitoring (Search Engine Roundtable + MozCast). Sprint Interrupt Protocol depends on this. Should run as a background launchd/systemd service.
- **Competitor Watch** — daily RSS diff + sitemap diff for all tracked competitors. New content flagged instantly.
- **Best Practices Monitor** — monthly digest from 12 named pundits (Barry Schwartz, Lily Ray, Kevin Indig, Marie Haynes, Aleyda Solis, John Mueller, Cyrus Shepard, Patrick Stox, Rand Fishkin, Ross Hudgens, Neil Patel, Brian Dean).

### Missing Pipeline Steps

#### Content Pipeline (currently 5 steps, Parth spec is 7)
- **Step 0a — SERP scan** — top 10 results: structure, word count, headings, what's missing. Required before brief.
- **Step 0b — 4-dimension diff** — what competitors cover / what we cover / gap / angle. Feeds outline.
- **Real AI score detection** — hardcoded at 6%. No ZeroGPT / Originality.ai integration.
- **Real keyword tally** — editor currently checks by LLM judgment. Should be a word-frequency count.
- **Minimum word count gate** — no hard reject under 1,500 words before editor pass.

#### Missing Agents
- **SEO Expert Reviewer** — "hard gate — nothing publishes without this pass." Validates title tags, meta descriptions, internal linking, schema, keyword placement. Not built.
- **Content Auditor** — periodic decay review of published content. Flags refresh opportunities. Not built.
- **Page Diagnosis Agent** — post-cooldown (90-day window) routing. Receives pages from Intelligence Report, compiles evidence brief, passes diagnosis to Strategist. Not built.
- **Digital PR & AI Search Optimizer** — GEO/AI Overview optimization + Skyscraper Technique. Tracks LLM visibility (ChatGPT, Perplexity, AI Overviews). Not built.
- **Keyword Research Analyst** — separate from Content Strategist. Seeded by Product Owner's validated service area map. Produces keyword universes for approved topics only. Not built.

#### Off-Page Gaps
- **GitHub API** — automated answers to GitHub discussions via PAT. Not built.
- **Outreach Manager** — separate agent that sends outreach via Odoo Email Module. Currently `off-page-seo` writes packages locally.
- **Guest post delivery** — content writer produces draft, outreach manager should deliver formatted doc to contact. Not wired end-to-end.
- **Digital PR data story** — 1 original data story per sprint maximum. No agent or runner for this.

### Sprint PM Gaps
- Only Day 1 ran. Days 2–10 not triggered (content batch, editing batch, graphics, publishing batch, social scheduling).
- **Daily 6 PM rollover check** not implemented — blocked tasks not detected or re-assigned.
- **Missed trigger detection** not implemented — no alert if tasks remain Pending past 11:59 PM.
- **Task dependency tracking** not implemented — downstream tasks don't shift when upstream is blocked.
- **Sprint-end carry-forward** not implemented — unresolved tasks don't auto-become Priority 1 in next sprint.
- **Sprint Interrupt integration** — on Algorithm Intelligence PAUSE signal, Sprint PM should pause content publishing tasks. Not wired.

### Telegram UX Gaps
- All approval messages link to local `file://` paths — should be Google Drive direct URLs.
- **Per-post social media approval** (each post individually before scheduling to SocialPilot) — currently all auto-approved in MOCK, skipped entirely.
- **Sprint Interrupt buttons** — PAUSE / CONTINUE / ASSESS not wired to any callback listener.
- **Fallback POC escalation** — no 24h reminder or 48h escalation to secondary contact implemented.
- **REVISE [instructions] handling** — Telegram force-reply for content REVISE is wired in content-approval-bridge but the revised instructions aren't passed to the editor agent cleanly.
- **Sprint strategy REVISE loop** — approval-bridge handles Revise/Reject but the reform loop (max 3 iterations before human escalation) doesn't have an iteration counter.

---

## Immediate Fixes (before next sprint)

### Priority 1 — Correctness
1. **Restore sprint-tasks JSON from CSV** — fix content-approval-bridge to write to `content-approval-[sprint_id].json` only, never overwrite sprint-tasks.
2. **Word count gate** — add to `run-content-pipeline.js`: after Step 2 (Writer), check word count. If under 1,500 words, re-run writer step with explicit word count instruction.
3. **Fix IST scheduled times** — fix `generateMockContent()` date math in `run-social-media.js`.

### Priority 2 — Pipeline Completion
4. **Run content tasks 6 + 7** — trigger `run-sprint-pm.js --day 2` and `--day 3` to process remaining content pipeline tasks.
5. **Off-page dispatch** — trigger off-page-seo orchestrator for Day 1 backlink + Quora + Reddit tasks.

---

## Phase Roadmap (bigger lifts)

| Phase | What | Key files |
|-------|------|-----------|
| Phase A | Google Drive integration | All runners + orchestrators |
| Phase B | Google Sheets API | `task-sheet-populator/`, `sprint-pm/` |
| Phase C | WordPress REST API publish | `publishing-agent/orchestrator.md`, `run-publishing-agent.js` |
| Phase D | SocialPilot API scheduling | `run-social-media.js` |
| Phase E | LinkedIn Newsletter agent | New: `linkedin-newsletter/`, `run-linkedin-newsletter.js` |
| Phase F | Real data sources | `pull-ga4`, `pull-gsc`, `pull-odoo`, `pull-clarity` (BigQuery + XML-RPC) |
| Phase G | SEO Expert Reviewer + Content Auditor | New agents: hard gate before publish |
| Phase H | Algorithm Intelligence (always-on) | New: `run-algorithm-watch.js` + launchd plist |
| Phase I | SERP scan + 4-dimension diff in content pipeline | Prepend to `run-content-pipeline.js` |
| Phase J | SocialPilot per-post approval (production Telegram UX) | `content-approval-bridge.js` extension |
