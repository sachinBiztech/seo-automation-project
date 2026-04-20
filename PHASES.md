# SEO Automation Engine — Phase-by-Phase Build Plan
**Reference:** `Concept from Parth.md` v3.0 + `remaining.md` audit
**Current state:** Mock pipeline working end-to-end through Sprint PM Day 2. Content pipeline loop not yet closed.
**Last updated:** 2026-04-17

---

## How to read this document

Each phase has:
- **Goal** — what this phase achieves
- **Steps** — exact actions in order
- **Files to change** — specific files to edit or create
- **Test** — how to verify it worked

Phases 0–4 are **mock mode** (no real APIs, local files only).
Phases 5+ require **real API credentials** and move toward production.

---

## Current State — What Is Working

```
✅ Intelligence Report (mock)     → PDF + Telegram approval gate
✅ SEO Strategist (mock)          → Sprint plan PDF + Telegram buttons
✅ Approve / Revise / Reject gate → callback-listener + approval-bridge
✅ Feedback loop (Revise/Reject)  → review-sprint-feedback (reform + full_rerun)
✅ Post-Approval                  → Product Owner + Business Layer (13 steps)
✅ POC Proceed gate               → Task Sheet Populator
✅ Sprint PM Day 1                → Technical SEO + Off-Page + Outreach (mock)
✅ Sprint PM Day 2                → Technical + Off-Page (content pipeline NOT run — bug)
🟡 Content pipeline               → built, not yet run end-to-end
🟡 Publishing Agent               → built, CMS API not wired
🟡 Social Media Engine            → built, SocialPilot API not wired
```

---

---

# PHASE 0 — Close the Mock Loop
**Goal:** Run Article 1 content pipeline → Telegram approval → publish → social. This is the last untested mock chain.
**Time estimate:** 1–2 hours (running agents + Telegram interactions)

---

### Step 0.1 — Fix the Day 2 content task status

The Article 1 task is stuck at `In Progress` in the sprint sheet but the content pipeline was never spawned. Reset it so it can be picked up.

```bash
# In the sprint tasks JSON, change Article 1 status back to "Not Started"
# File: outputs/sprint-tasks-biztechcs_sprint_2026-04-17.json
# Find: "Odoo Implementation Partner India..." task → change status to "Not Started"
```

**File to edit:** `~/.openclaw/workspace/seo-automation/outputs/sprint-tasks-biztechcs_sprint_2026-04-17.json`
Change the Day 2 content task `status` field from `"In Progress"` → `"Not Started"`.

---

### Step 0.2 — Run content pipeline for Article 1

```bash
openclaw agent --agent sprint-pm --message "Run the content pipeline for sprint biztechcs_sprint_2026-04-17. Task Sr4: Odoo Implementation Partner India: Why BiztechCS Delivers Better Value in 2026. Primary keyword: odoo implementation partner india. Author: Uttam. Target word count: 2500. Read seo-automation/content-pipeline/orchestrator.md and execute all steps."
```

**Expected outputs:**
- `outputs/content-brief-odoo-implementation-partner-india.json`
- `outputs/draft-odoo-implementation-partner-india.md`
- `outputs/edited-draft-odoo-implementation-partner-india.md`
- `outputs/image-prompts-odoo-implementation-partner-india.json`
- `outputs/preview-odoo-implementation-partner-india.html`
- `outputs/pipeline-result-[task_id].json`

**Expected Telegram message:**
```
📄 Content Ready for Review: Odoo Implementation Partner India...
Reply: APPROVE / REJECT
```

---

### Step 0.3 — Approve via Telegram → Publishing Agent

Reply `APPROVE` on Telegram.

`content-approval-bridge.js` receives it → triggers `run-publishing-agent.js`.

**Expected outputs:**
- `outputs/published-odoo-implementation-partner-india.json` (mock — no real CMS)
- Telegram: `✅ Published: [title]`

---

### Step 0.4 — Social Media Engine fires

Publishing Agent triggers `social-media/orchestrator.md`.

**Expected Telegram message:**
```
📋 Social Idea Bank — Sprint biztechcs_sprint_2026-04-17
Idea #1: LinkedIn Carousel — ...
Idea #2: X Thread — ...
Reply: ✅ [n] to approve / ❌ [n] to skip
```

Approve ideas → posts scheduled (mock, no SocialPilot API).

**Phase 0 complete when:** Social mock scheduling outputs exist.

---

---

# PHASE 1 — Fix Sprint Plan Structure (Mock)
**Goal:** Sprint plan goes from 5/10 sections to all 10 sections as specified in Concept from Parth Section 5.
**Why:** The 3 orphaned subskills exist but are never called. Sections 6, 7 don't exist at all.

---

### Step 1.1 — Wire the 3 orphaned subskills into seo-strategist/orchestrator.md

**File to edit:** `seo-strategist/orchestrator.md`

Add three new steps after Step 3c (Off-Page Offensive) and before Step 4 (Assemble):

**New Step 3d — Define Metrics**
```
Spawn sub-agent:
  label: "Step 3d — Define Metrics"
  task: "Read seo-automation/seo-strategist/subskills/define-metrics.md and follow ALL instructions. Read attack-vectors.json, content-plan.json, technical-plan.json, offpage-plan.json. Write outputs/metrics-plan.json. Reply ONLY with: ✅ metrics-plan.json written"
Expected output: seo-automation/outputs/metrics-plan.json
Failure action: WARNING — continue
```

**New Step 3e — Expert Intelligence Map**
```
Spawn sub-agent:
  label: "Step 3e — Expert Intelligence Map"
  task: "Read seo-automation/seo-strategist/subskills/build-expert-intelligence-map.md and follow ALL instructions. Read attack-vectors.json, content-plan.json, offpage-plan.json, report-summary.json. Write outputs/expert-intelligence-map.json. Reply ONLY with: ✅ expert-intelligence-map.json written"
Expected output: seo-automation/outputs/expert-intelligence-map.json
Failure action: WARNING — continue
```

**New Step 3f — History-Backed Rationale**
```
Spawn sub-agent:
  label: "Step 3f — History-Backed Rationale"
  task: "Read seo-automation/seo-strategist/subskills/build-history-rationale.md and follow ALL instructions. Read attack-vectors.json, content-plan.json. Write outputs/history-rationale.json. Reply ONLY with: ✅ history-rationale.json written"
Expected output: seo-automation/outputs/history-rationale.json
Failure action: WARNING — continue (first sprint has no history — write baseline)
```

Also update Step 4 (Assemble) task instruction to include the new files:
`Also read outputs/metrics-plan.json, outputs/expert-intelligence-map.json, outputs/history-rationale.json if they exist.`

---

### Step 1.2 — Add Section 6 (Social Amplification) and Section 7 (AI Overview Targets) to assemble-sprint-plan.md

**File to edit:** `seo-strategist/subskills/assemble-sprint-plan.md`

Section 6 — Social Amplification: Per content piece, specify LinkedIn post type, X thread outline, Instagram concept, Reddit subreddit + angle, Quora matched question.

Section 7 — AI Overview Targets: Per target query, current citation status (we cited / competitor cited / none) + specific content approach to get cited (structured answer block, FAQ schema, data point).

---

### Step 1.3 — Add Section 6 and 7 to the sprint plan HTML template

**File to edit:** `seo-strategist/subskills/assemble-sprint-plan.md` (HTML section)

Add two new `<section>` blocks in the HTML template for Social Amplification and AI Overview Targets. Match the existing visual style.

---

### Step 1.4 — Update the cleanup list in seo-strategist/orchestrator.md Step 0

**File to edit:** `seo-strategist/orchestrator.md`

Add these files to the `rm -f` list in Step 0:
```
metrics-plan.json
expert-intelligence-map.json
history-rationale.json
```

---

### Test Phase 1

Run the full strategist pipeline:
```bash
node run-pipeline.js
```

Verify the delivered sprint plan PDF/HTML contains all 10 sections including Metrics to Move, Expert Intelligence Applied, and History-Backed Rationale.

---

---

# PHASE 2 — Competitor Keyword Position Table (Mock)
**Goal:** Q10 in the Intelligence Report produces a cumulative competitor position table. The SEO Strategist reads it before selecting attack vectors. Per Concept: this is the primary lens for attack vector selection every sprint.

---

### Step 2.1 — Create competitor-position-table.json as Q10 output

**File to edit:** `intelligence-report/subskills/run-20-questions.md`

Add to the Q10 output specification: write a separate `competitor-position-table.json` file alongside `research-findings.json`.

Format:
```json
{
  "generated": "YYYY-MM-DD",
  "sprint_cycle": "N",
  "keywords": [
    {
      "keyword": "odoo implementation partner india",
      "our_position": 14,
      "competitors": [
        { "domain": "technofaces.com", "position": 3, "delta_since_last_cycle": -2 },
        { "domain": "brainvire.com", "position": 7, "delta_since_last_cycle": +1 }
      ],
      "featured_snippet": "technofaces.com",
      "ai_overview_cited": null,
      "attack_window": true
    }
  ]
}
```

`attack_window: true` when we are within 3–5 positions of overtaking a competitor.

**File to create:** `mock-data/competitor-position-table-mock.json`
Populate with 20–30 mock keywords for BiztechCS target keyword universe.

---

### Step 2.2 — Wire competitor-position-table.json into Intelligence Report output

**File to edit:** `intelligence-report/subskills/assemble-report.md`

Add to the `report-summary.json` output schema:
```json
"competitor_position_table_path": "seo-automation/outputs/competitor-position-table.json"
```

**File to edit:** `intelligence-report/orchestrator.md`

Add to the cleanup list in the stale outputs step:
```
competitor-position-table.json
```

---

### Step 2.3 — Wire into SEO Strategist Step 2 (identify-attack-vectors)

**File to edit:** `seo-strategist/subskills/identify-attack-vectors.md`

Add to the Input section:
```
Read: seo-automation/outputs/competitor-position-table.json
```

Add to the Task instructions:
```
Before selecting any attack vector, read competitor-position-table.json.
- Flag all keywords where attack_window = true (we are 3–5 positions from overtaking a competitor)
- Flag all competitors who gained 5+ positions since last cycle
- Attack Vector selection MUST be cross-referenced against this table — at least 1 of the 3 vectors must target an attack_window keyword
```

---

### Test Phase 2

Run full pipeline (intelligence report → strategist). Verify:
1. `outputs/competitor-position-table.json` is written after the Intelligence Report run
2. Attack vectors in sprint plan reference specific competitor domains from the table

---

---

# PHASE 3 — Wire Keyword Research into Content Pipeline (Mock)
**Goal:** Content pipeline starts with keyword research seeded by Product Owner service area, not a blank brief. Currently content-strategist receives no keyword input.

---

### Step 3.1 — Add Step 0 (Keyword Research) to content-pipeline/orchestrator.md

**File to edit:** `content-pipeline/orchestrator.md`

Add a new Step 0 before the existing Step 1 (Content Strategist):

```
Step 0 — Keyword Research
Spawn sub-agent:
  label: "Step 0 — Keyword Research"
  task: "Read seo-automation/keyword-research/orchestrator.md and follow ALL instructions. Sprint ID: [sprint_id]. Article task: [title]. Primary keyword seed: [primary_keyword]. Read seo-automation/outputs/pipeline-context-[task_id].json. Write outputs/keyword-universe-[slug].json. Reply ONLY with: ✅ keyword-universe-[slug].json written"
Expected output: seo-automation/outputs/keyword-universe-[slug].json
Failure action: WARNING — continue with primary keyword only
```

---

### Step 3.2 — Update content-strategist to read keyword universe

**File to edit:** `content-pipeline/orchestrator.md` Step 1 task instruction

Add:
```
Also read seo-automation/outputs/keyword-universe-[slug].json if it exists — use the keyword clusters to inform the content brief.
```

---

### Step 3.3 — Update keyword-research/orchestrator.md to accept task context

**File to edit:** `keyword-research/orchestrator.md`

The orchestrator currently runs as a standalone agent. Modify it to:
1. Accept a `primary_keyword` seed from pipeline-context
2. Produce `keyword-universe-[slug].json` with: primary keyword, 5–8 secondary keywords, search volumes (mock), intent classification, competitor ranking pages

---

### Test Phase 3

Run content pipeline for a new article. Verify `keyword-universe-[slug].json` is produced and content-brief references secondary keywords from it.

---

---

# PHASE 4 — Content Approval REVISE Flow (Mock)
**Goal:** Add the third Telegram response option (REVISE [instructions]) to content approval. Currently only APPROVE / REJECT exist.

---

### Step 4.1 — Add REVISE handling to content-approval-bridge.js

**File to edit:** `content-approval-bridge.js`

Add a new action handler for `revise`:
- Detect message starting with `REVISE` (case-insensitive)
- Extract instructions text after `REVISE`
- Write `outputs/content-revision-[task_id].json` with `{ "action": "revise", "instructions": "..." }`
- Fire openclaw event to re-trigger content-pipeline with revision scope
- Send Telegram: `🔄 Revision received for [title]. Applying targeted edits...`

---

### Step 4.2 — Add REVISE path to content-pipeline/orchestrator.md

**File to edit:** `content-pipeline/orchestrator.md`

Add a new execution path triggered when `content-revision-[task_id].json` exists:
- Skip Steps 0 and 1 (keyword research + content strategy — already done)
- Go directly to Step 2b (Writer Revision) with the revision instructions as scope
- Re-run editor → graphics → HTML preview
- Overwrite the same `preview-[slug].html` file
- Send Telegram: `📄 Revised: [title] — same preview link updated. Please re-review.`

---

### Step 4.3 — Update the Telegram content approval message

**File to edit:** `html-preview/orchestrator.md`

Update the Telegram delivery message to include:
```
Reply:
APPROVE — publishes exactly this
REJECT — returns to writer + graphics
REVISE [your instructions] — targeted edit, same preview link updated
```

---

### Test Phase 4

Run content pipeline. When Telegram approval message arrives, reply `REVISE add a comparison table between Odoo and SAP in Section 3`. Verify:
1. Revision instructions captured
2. Writer revision pass runs (not full rewrite)
3. HTML preview updated
4. New Telegram message says "same preview link updated"

---

---

# PHASE 5 — Sprint PM Fixes (Mock)
**Goal:** Fix the Day 2 content pipeline bug. Add missed trigger detection. Fix sprint task sheet columns.

---

### Step 5.1 — Fix content pipeline not spawning when content task is on today's list

**File to edit:** `sprint-pm/orchestrator.md`

In Step 6, the current condition is implicit. Make it explicit:

```
Step 6 — Spawn Content Pipeline
Check today's tasks for any task where taskType = "Content" AND status = "Not Started".
For EACH such task, spawn content-pipeline subagent.
If no content tasks today: skip this step entirely.
```

Also: write `sprint-pm-dispatch-[date].json` BEFORE spawning agents (not after), so content pipeline gets properly logged as dispatched.

---

### Step 5.2 — Add missed trigger detection

**File to edit:** `sprint-pm/orchestrator.md`

Add at the END of Step 7 (after writing the log file), before the Telegram message:

```
Check: are there any tasks with status = "Not Started" where scheduledDay = today AND it is now past 11:00 PM?
If yes: include in Telegram alert: "⚠️ [N] tasks assigned today did not complete. Manual check required."
```

---

### Step 5.3 — Add Assigned Day, Assigned Date, Dependency columns to task sheet

**File to edit:** `task-sheet-populator/orchestrator.md`

Add three new columns to the sheet schema:
- `assignedDay` — integer 1–10
- `assignedDate` — actual calendar date (sprint_start + assignedDay - 1, skip weekends)
- `dependency` — Sr number of upstream task (blank if independent)

**File to edit:** `task-sheet-populator.js`

Update the CSV/JSON output to include these three columns with calculated values.

---

### Test Phase 5

Run Sprint PM for Day 3. Verify:
1. Content pipeline is spawned for Day 3 content tasks
2. Sprint PM log includes `content-pipeline` in `agents_dispatched`
3. Sprint tasks JSON has `assignedDay`, `assignedDate`, `dependency` fields

---

---

# PHASE 6 — Business Layer Reliability (Mock)
**Goal:** Product Owner loop cap + 24h/48h POC escalation. Prevents infinite loops and ensures sprint never silently waits forever.

---

### Step 6.1 — Add 3-iteration loop cap to post-approval/orchestrator.md

**File to edit:** `post-approval/orchestrator.md`

Add iteration counter to the Product Owner reform loop:
- After each PO revision request, increment `po_revision_count` in the state file
- If `po_revision_count >= 3`: stop the loop, send Telegram:
  ```
  ⚠️ Product Owner review loop reached 3 iterations without approval.
  Human SME decision required. Sprint plan + revision history: [path]
  Reply OVERRIDE to approve as-is or INSTRUCT [direct changes].
  ```
- Add `callback-listener.js` handling for `OVERRIDE` and `INSTRUCT` responses

---

### Step 6.2 — Add 24h/48h escalation for POC non-response

**File to edit:** `post-approval/orchestrator.md`

After Business Layer sends the GO message to POC, write a `pending-poc-approval-[sprint_id].json` with a timestamp.

**New file to create:** `check-poc-timeout.js`

A lightweight script (run by launchd cron at 9 AM and 9 PM) that:
1. Checks if `pending-poc-approval-[sprint_id].json` exists
2. If `created_at` is 24h ago → send Telegram reminder to primary POC
3. If `created_at` is 48h ago → send Telegram direct message to fallback POC
4. If approved (file deleted) → do nothing

---

### Test Phase 6

Run post-approval with a product-owner-config.md that contains a CANNOT rule that the sprint plan violates. Verify the loop counter increments and stops at 3 iterations.

---

---

# PHASE 7 — Google Drive + Google Sheets API
**Goal:** Every agent output saves to Drive. Sprint task tracker is a real Google Sheet. This is the biggest production unlocker — everything downstream depends on it.

---

### Step 7.1 — Service account setup

1. Create a Google Cloud project (or use existing)
2. Enable: Google Drive API, Google Sheets API
3. Create service account → download JSON key
4. Store key at: `~/.openclaw/secrets/google-service-account.json`
5. Share the Drive folder and Sheets with the service account email

---

### Step 7.2 — Create Drive folder structure (once per website)

```
/SEO Automation Engine/
├── Intelligence Reports/2026/
├── Sprint Strategies/2026/
├── Content Assets/
├── HTML Previews/
├── Outreach/
├── Social/
└── Logs/
```

Run once manually or write a `setup-drive.js` script.

---

### Step 7.3 — Create drive-helper.js utility

**New file:** `drive-helper.js`

Functions:
- `uploadFile(localPath, driveFolderPath)` → returns Drive file URL
- `createSheet(name, columns)` → returns Sheet ID
- `updateSheetRow(sheetId, rowIndex, data)` → updates a single row
- `appendSheetRow(sheetId, data)` → appends a new row

All agents call these functions instead of writing to local disk only.

---

### Step 7.4 — Update task-sheet-populator.js to create real Google Sheet

**File to edit:** `task-sheet-populator.js`

Replace local CSV write with:
1. `drive-helper.createSheet()` to create the sprint sheet
2. Write all task rows via `drive-helper.appendSheetRow()`
3. Save `sheet_id` and `sheet_url` to `outputs/sprint-sheet-[sprint_id].json`
4. Send Telegram with the Sheet link: `✅ Sprint sheet live: [URL]`

---

### Step 7.5 — Update execution agents to write back to sheet

**Files to edit:** `technical-seo/orchestrator.md`, `content-pipeline/orchestrator.md`, `publishing-agent/orchestrator.md`, `off-page-seo/orchestrator.md`, `outreach-manager/orchestrator.md`, `social-media/orchestrator.md`

Each agent must:
1. Read `sprint-sheet-[sprint_id].json` to get the sheet ID
2. On status change (In Progress, Done, Blocked), call `drive-helper.updateSheetRow()` for its row
3. Populate `Drive Link` column when output file is saved to Drive

---

### Step 7.6 — Update intelligence-report and seo-strategist to save to Drive

**Files to edit:** `intelligence-report/subskills/deliver-report.md`, `seo-strategist/subskills/deliver-sprint-plan.md`

After generating PDF: call `drive-helper.uploadFile()` to save to the correct Drive folder. Include the Drive URL in the Telegram message.

---

### Test Phase 7

Run full pipeline from intelligence report through sprint PM Day 1. Verify:
1. Intelligence Report PDF appears in Drive `/Intelligence Reports/2026/`
2. Sprint plan PDF appears in Drive `/Sprint Strategies/2026/`
3. Sprint task sheet is a live Google Sheet with all rows populated
4. After Technical SEO runs, the sheet row shows `Done` with completion date

---

---

# PHASE 8 — Real API Wiring
**Goal:** Replace all mock data reads with live API calls. Run each sub-system independently before running the full pipeline.

**Wire in this order (each one independently testable):**

---

### Step 8.1 — Odoo XML-RPC (highest business value first)

**File to edit:** `intelligence-report/subskills/pull-odoo-leads.md`

Change Mode: MOCK → PRODUCTION

Input:
```
ODOO_URL=https://[your-odoo-instance].odoo.com
ODOO_DB=[database]
ODOO_USER=[email]
ODOO_PASSWORD=[API key]
```

Query: `crm.lead` model — MTD/QTD/YTD leads, MQLs, SQLs, source breakdown, landing pages.

Test: Run `pull-odoo-leads` subskill in isolation. Verify `odoo-findings.json` contains real lead counts.

---

### Step 8.2 — GSC → BigQuery

**File to edit:** `intelligence-report/subskills/pull-gsc-data.md`

BigQuery SQL query against `searchconsole.searchdata_site_impression` table.
Three window queries: 15-day, 90-day, 180-day.
Regional segmentation: filter by country group (North America / Europe / ME&A / ANZ).

Test: Run in isolation. Verify `gsc-findings.json` has real impression + position data with regional breakdown.

---

### Step 8.3 — GA4 → BigQuery

**File to edit:** `intelligence-report/subskills/pull-ga4-data.md`

BigQuery SQL against `analytics_[property_id].events_*` table.
Three window queries: 15-day, 90-day, 180-day.
Filter: `event_name = 'session_start'`, exclude bot traffic.

Test: Run in isolation. Verify `ga4-findings.json` has real session + organic share data.

---

### Step 8.4 — SerpAPI (Competitor Keyword Position Table)

**File to edit:** `intelligence-report/subskills/run-20-questions.md` (Q10 section)

Replace mock competitor positions with SerpAPI calls per tracked keyword.
Store cumulative history: load previous `competitor-position-table.json`, add new cycle's data, save updated.

Test: Run Q10 in isolation. Verify `competitor-position-table.json` has real positions.

---

### Step 8.5 — Ahrefs Webmaster API

**File to edit:** `intelligence-report/subskills/competitor-monitor.md`

Replace mock backlink data with Ahrefs API calls.
New backlinks for tracked competitor domains since last cycle.

---

### Step 8.6 — Microsoft Clarity API

**File to edit:** `intelligence-report/subskills/pull-clarity-data.md`

Clarity REST API v0. Rage clicks, dead clicks, scroll depth per page.
Fallback: if API rate-limited, use last known data + flag in report.

---

### Step 8.7 — CMS Publish API

**File to edit:** `publishing-agent/orchestrator.md`

Replace mock publish with real CMS API call.
Read the approved HTML from Drive. POST to CMS endpoint.
Archive HTML to Drive `/HTML Previews/Sprint_[dates]/Approved/`.
Update sheet row to `Published`.

---

### Step 8.8 — SocialPilot API

**File to edit:** `social-media/orchestrator.md`

Replace mock scheduling with real SocialPilot API calls.
`POST /v1/posts` for each approved platform post with scheduled time.

---

### Step 8.9 — Odoo Email Module (Intelligence Report delivery)

**File to edit:** `intelligence-report/subskills/deliver-report.md`

Add Odoo `mail.mail` XML-RPC call to send PDF to stakeholder distribution list.
In addition to Telegram alert — both channels required.

---

---

# PHASE 9 — Intelligence Report Production Upgrades
**Goal:** Intelligence Report fully matches the Concept spec — proper time windows, regional segmentation, fix verification, cooldown tracking.

---

### Step 9.1 — Performance lookback 15d / 90d / 180d windows

**Files to edit:** `intelligence-report/subskills/pull-gsc-data.md`, `pull-ga4-data.md`, `pull-ranking-data.md`

All three data pulls must return data for three separate windows.
`assemble-report.md` must present:
- 15-day delta: supplementary signal only (not used for strategic decisions)
- 90-day trend: primary assessment window
- 180-day baseline: context + seasonality

Trend classification per keyword/page: Climbing / Holding / Declining / Volatile (based on 90-day window, not delta).

---

### Step 9.2 — GSC Regional Segmentation

**File to edit:** `intelligence-report/subskills/pull-gsc-data.md`

Four regional BigQuery queries:
- `WHERE country IN ('USA', 'CAN', ...)` — North America
- `WHERE country IN ('GBR', 'DEU', ...)` — Europe
- `WHERE country IN ('ARE', 'SAU', ...)` — Middle East & Africa
- `WHERE country IN ('AUS', 'NZL')` — Australia & NZ

**File to edit:** `intelligence-report/subskills/assemble-report.md`

Add regional breakdown table to `report-summary.json` and to the HTML report.

---

### Step 9.3 — Source Attribution Coverage Check

**File to edit:** `intelligence-report/subskills/pull-odoo-leads.md`

After pulling leads: check what percentage have `source_id` populated.
If < 80%: set `attribution_flag: true` in `odoo-findings.json`.

**File to edit:** `intelligence-report/subskills/assemble-report.md`

If `attribution_flag: true`: add warning banner to landing page section:
`⚠️ Source attribution coverage [X]% — landing page attribution may be incomplete.`

---

### Step 9.4 — Previous Sprint Fix Verification

**File to edit:** `intelligence-report/subskills/assemble-report.md`

At the start of assembly:
1. Read previous sprint's sheet (via Sheets API)
2. Find all rows where `taskType = Technical/Fix` AND `status = Done`
3. For each fixed page: pull current GSC position, impressions, CTR
4. Classify: ✅ Recovered / ⏳ In Progress / ❌ Not Recovered
5. Include verdict table in report and `report-summary.json`

---

### Step 9.5 — Page Cooldown tracking in Sprint Sheet

**File to edit:** `task-sheet-populator.js`

When creating rows for Technical fix tasks:
- Add `cooldown_start` = scheduled completion date
- Add `cooldown_expires` = scheduled completion date + 90 days
- Set initial cooldown status = blank (populated when task is marked Done)

**File to edit:** `technical-seo/orchestrator.md`

When a fix task is marked Done: update the sheet row with:
- `cooldown_start` = today's date
- `cooldown_expires` = today + 90 days
- `cooldown_status` = `Active`

**New section in `intelligence-report/subskills/assemble-report.md`:**

Add "In Cooldown — Watch List" section: pages currently in cooldown, days remaining, current GSC trend (monitored only, no action).

---

### Step 9.6 — Page Diagnosis Agent trigger on cooldown expiry

**New file:** `check-cooldowns.js`

Daily cron script (runs at 6 AM alongside intelligence report trigger):
1. Read all sprint sheets via Sheets API
2. Find rows where `cooldown_status = Active` AND `cooldown_expires <= today`
3. For each expired page: fire `openclaw agent --agent page-diagnosis` with the page URL + full history
4. Write `outputs/page-diagnosis-[slug].json`
5. SEO Strategist reads this file before creating any new fix task for that page

---

---

# PHASE 10 — Continuous Watch Agents (Production)
**Goal:** Algorithm Intelligence, Best Practices Monitor, and Competitor Watch run on cron. Sprint Interrupt is wired.

---

### Step 10.1 — Algorithm Intelligence on daily launchd cron

**File:** `~/Library/LaunchAgents/seo.algorithm.intelligence.plist`
Trigger: daily at 7:00 AM

```xml
<key>ProgramArguments</key>
<array>
  <string>/usr/local/bin/node</string>
  <string>/path/to/run-algorithm-intelligence.js</string>
</array>
<key>StartCalendarInterval</key>
<dict><key>Hour</key><integer>7</integer><key>Minute</key><integer>0</integer></dict>
```

**New file:** `run-algorithm-intelligence.js`
Calls `openclaw agent --agent algorithm-intelligence`.

---

### Step 10.2 — Wire Sprint Interrupt to callback-listener.js

**File to edit:** `callback-listener.js`

Add handling for `sprint_interrupt` action:
- `PAUSE` → write `outputs/sprint-interrupt-[sprint_id].json` with `action: "pause"` → sprint-pm reads this before triggering any publishing tasks
- `CONTINUE` → delete the interrupt file
- `ASSESS` → fire algorithm-intelligence for rapid-response brief

**File to edit:** `sprint-pm/orchestrator.md`

At Step 2 (find today's tasks): check if `sprint-interrupt-[sprint_id].json` exists.
If `action: "pause"`: skip all Content and Publishing tasks. Run Technical + Off-Page only.

---

### Step 10.3 — Best Practices Monitor monthly cron

**File:** `~/Library/LaunchAgents/seo.best-practices.plist`
Trigger: 1st of each month at 8:00 AM

Writes `outputs/best-practices-digest-[YYYY-MM].json`.
SEO Strategist reads this file in Step 1 (read-intelligence-brief) alongside `report-summary.json`.

---

### Step 10.4 — Competitor Watch daily/weekly cron

Daily cron: new competitor content (RSS diff, sitemap diff)
Weekly cron: ranking movements, new backlinks

**File to edit:** `competitor-watch/orchestrator.md`

Add: instant Telegram alert when competitor earns a high-DA backlink on a core keyword:
```
⚠️ Competitor alert — [competitor] earned a DA [N] backlink from [domain] on keyword "[keyword]"
```

---

---

# PHASE 11 — Multi-Site Deployment
**Goal:** PrintXpand, CRMJetty, AppJetty go live. Machine 2 deployed.

---

### Step 11.1 — Create product-owner-config.md for each remaining site

**Files to create (in OpenClaw memory):**
- `printxpand-product-owner-config.md`
- `crmjetty-product-owner-config.md`
- `appjetty-product-owner-config.md`

Each file: site identity, active product scope, ICP, competitor positioning, messaging guardrails, named authors.

---

### Step 11.2 — Create business-config.md for each remaining site

**Files to create (in OpenClaw memory):**
- `printxpand-business-config.md`
- `crmjetty-business-config.md`
- `appjetty-business-config.md`

Each file: annual goals ÷ 26 sprints, content quotas (see table in Concept), POC Telegram IDs, fallback POC, seasonality weights.

---

### Step 11.3 — Parameterise all orchestrators for site name

All orchestrators currently hardcode `BiztechCS` and `biztechcs_`. Replace with a site variable passed at runtime:

**Files to edit:** All `orchestrator.md` files that reference `BiztechCS` or `biztechcs`.

Replace hardcoded site name with `[SITE]` placeholder resolved from `openclaw-config.json` or a `--site` flag passed by the runner.

---

### Step 11.4 — Machine 2 deployment

1. Clone repo on Machine 2
2. Install dependencies (`npm install`)
3. Set workspace path in all runner scripts
4. Seed PrintXpand + CRMJetty configs in OpenClaw memory
5. Configure launchd plists:
   - PrintXpand: Intelligence 1st + 16th 6AM, Sprint PM 9PM Mon–Fri
   - CRMJetty: Intelligence 1st + 16th 6AM, Sprint PM 12:30AM Tue–Sat

---

### Step 11.5 — launchd crons on both machines

**Machine 1 (BiztechCS + AppJetty):**
```
seo.intelligence.biztechcs.plist    → 1st + 16th, 6AM
seo.sprint-pm.biztechcs.plist       → 9PM Mon–Fri
seo.intelligence.appjetty.plist     → 1st + 16th, 6AM (offset by 2h)
seo.sprint-pm.appjetty.plist        → 12:30AM Tue–Sat
seo.algorithm.intelligence.plist    → daily 7AM
seo.check-cooldowns.plist           → daily 6AM
```

**Machine 2 (PrintXpand + CRMJetty):** Same structure, different site names.

---

---

## Summary — Build Order

```
NOW         Phase 0    Close mock loop (content → Telegram → publish → social)

MOCK FIXES  Phase 1    Fix sprint plan (add sections 6–10, wire orphaned subskills)
            Phase 2    Competitor Keyword Position Table
            Phase 3    Wire keyword-research into content pipeline
            Phase 4    Content approval REVISE flow
            Phase 5    Sprint PM fixes (content bug, missed trigger, sheet columns)
            Phase 6    Business Layer reliability (loop cap, 24h/48h escalation)

PRODUCTION  Phase 7    Google Drive + Sheets API  ← biggest unlocker
            Phase 8    Real API wiring (Odoo → GSC/GA4 → SerpAPI → CMS → SocialPilot)
            Phase 9    Intelligence Report upgrades (windows, regions, cooldowns)
            Phase 10   Continuous Watch Agents on cron
            Phase 11   Multi-site deployment (PrintXpand, CRMJetty, AppJetty)
```

**Each phase is independently testable before moving to the next.**
**Do not skip phases — each one feeds the next.**
