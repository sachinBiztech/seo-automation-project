# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

An autonomous SEO operation engine. It runs biweekly on always-on Mac Minis, pulling SEO data,
generating a 15-day offensive sprint plan, routing it through human approval gates via Telegram,
and auto-populating a Google Sheets sprint tracker for the execution team.

**Target websites:** BiztechCS, PrintXpand, CRMJetty, AppJetty (Odoo implementation partners)

## ⚠️ Before Running — Critical Setup

The Node.js runners hardcode the workspace path. **You must update this before running on any machine:**

```js
// In run-pipeline.js and run-intelligence-pipeline.js, line ~22:
const WORKSPACE = '/home/sachin.p/.openclaw/workspace';
// Change to your local OpenClaw workspace path, e.g.:
// const WORKSPACE = '/home/yourname/.openclaw/workspace';
```

Also, both runners currently call `openai/gpt-4.1-mini` via `openclaw infer model run`. The
orchestrator `.md` files specify Claude models (claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5-20251001),
but the actual Node.js pipelines bypass those and use the OpenAI model directly. To switch to Claude,
change the `MODEL` constant in each runner.

## Running the Pipelines

There is **no `openclaw run` command**. The pipelines are run directly with Node:

```bash
# Intelligence Report pipeline (data pull + report assembly)
node run-intelligence-pipeline.js

# Full SEO Strategist pipeline (sprint plan generation)
node run-pipeline.js

# Dry run (shows steps without making API calls)
node run-pipeline.js --dry-run
node run-intelligence-pipeline.js --dry-run

# Resume from a specific step
node run-pipeline.js --from 4g
node run-pipeline.js --from 5

# Skip human approval gates (Product Owner / Quota checks)
node run-pipeline.js --force

# Content pipeline (requires --sprint-id and --task-id or --slug)
node run-content-pipeline.js --sprint-id biztechcs_sprint_2026-04-17 --task-id 4
node run-content-pipeline.js --sprint-id X --task-id 4 --from editor   # resume from step
node run-content-pipeline.js --sprint-id X --slug my-slug --from writer

# Publishing agent (triggered automatically by content-approval-bridge.js on APPROVE)
node run-publishing-agent.js --sprint-id biztechcs_sprint_2026-04-17 --slug odoo-impl-india

# Social media engine (triggered automatically by publishing agent after publish)
node run-social-media.js --sprint-id biztechcs_sprint_2026-04-17 --slug odoo-impl-india

# Sprint PM (daily execution orchestrator)
node run-sprint-pm.js --sprint-id biztechcs_sprint_2026-04-17
node run-sprint-pm.js --sprint-id X --day 2   # override day number
```

Telegram messages are sent automatically by the pipeline scripts — no manual `openclaw message send` needed.

## Agent File Anatomy

Every agent (orchestrator or subskill) is a `.md` file with this structure:

```markdown
# [Agent Name]

## Purpose
[What this agent does]

## Model
[claude-opus-4-6 | claude-sonnet-4-6 | claude-haiku-4-5-20251001]

## Mode
[MOCK | PRODUCTION]

## Input
[Files to read, with full paths from OpenClaw workspace root]

## Task
[Detailed instructions for the agent]

## Output
[Files to write, with JSON schema or format spec]
```

**Model selection convention (for orchestrator .md files):**
- `claude-opus-4-6` — orchestrators, strategy agents, complex reasoning
- `claude-sonnet-4-6` — analysis, insight generation, report assembly
- `claude-haiku-4-5-20251001` — data pull subskills, pure data processing

**Note:** The Node.js pipeline runners (`run-pipeline.js`, `run-intelligence-pipeline.js`) use
`openclaw infer model run --model <MODEL>` to call the model. The `MODEL` constant in those files
determines what is actually called at runtime — the `## Model` field in the `.md` files is
a convention/spec, not automatically enforced.

**Mode:** All current agents run `MOCK` (reading from `mock-data/`). When upgrading to production,
change `## Mode` to `PRODUCTION` and update the `## Input` section to call the real API.

## File Path Convention

All paths inside agent `.md` files use the OpenClaw workspace root prefix:
```
seo-automation/mock-data/gsc-mock.json      ← input
seo-automation/outputs/gsc-findings.json    ← output
```
This prefix (`seo-automation/`) reflects how OpenClaw resolves paths relative to its workspace —
not relative to this repo root.

## Orchestrator Pattern

Orchestrators define a numbered run sequence where each step:
1. Calls a named subskill (by folder name, not file path)
2. Declares the expected output file
3. Declares a failure action: **STOP** (critical) or **WARNING** (continue)

```markdown
### Step N — [Step Name]
Run subskill: `subskill-folder-name`
Expected output: `seo-automation/outputs/[filename].json`
Failure action: STOP. Send Telegram: "❌ [Site] FAILED at Step N ([reason])."
```

**CRITICAL failures** (STOP + Telegram alert): GA4, GSC, Odoo, Rankings, Analysis, Assembly
**WARNING failures** (continue, note gap in report): Clarity, competitor scrape, algorithm signals

## Pipeline Architecture

The full build plan is in `GUIDE.md`. Current state (all mock):

```
Intelligence Report → SEO Strategist → Approve/Revise/Reject gate
  → review-sprint-feedback (reform or full_rerun) → post-approval → task-sheet-populator
  → Sprint PM → Content Pipeline → Publishing Agent → Social Media Engine
```

Target state (production):
```
Intelligence Report (live APIs) → SEO Strategist → Product Owner Review → Business Layer
  → Task Sheet Populator → Sprint PM → Execution Agents → Social Media Engine (SocialPilot API)
```

### Intelligence Report (`intelligence-report/`)
- **Runner:** `node run-intelligence-pipeline.js`
- **Trigger:** 1st and 16th of each month at 6 AM (launchd cron)
- **10-step pipeline:** pull-ga4 → pull-gsc → pull-rankings → pull-odoo → pull-clarity →
  competitor-monitor → algorithm-signals → run-20-questions → generate-insights +
  assemble-report → deliver-report
- **Critical outputs:** `outputs/report-summary.json` (inter-agent handoff) +
  `outputs/intelligence-report.md` (human-readable)
- **Human gate:** Telegram message → APPROVE / REVISE / REJECT

### SEO Strategist (`seo-strategist/`)
- **Runner:** `node run-pipeline.js` (or run `seo-strategist/orchestrator.md` directly via openclaw)
- Reads `outputs/intelligence-report/report-summary.json`
- Produces 15-day sprint plan across 3 attack vectors: Content, Technical, Off-Page
- **Core principle:** Every plan answers *"What structural advantage can we create in 15 days?"*
- **Human gate:** Telegram PDF + [✅ Approve] [🔄 Revise] [❌ Reject] inline buttons
  - **Approve** → triggers `post-approval` orchestrator (Product Owner + Business Layer)
  - **Revise / Reject** → bot sends `force_reply` prompt asking what needs to change →
    user replies with feedback → `review-sprint-feedback` orchestrator evaluates feedback →
    agent decides: **reform** (fix specific sections, re-deliver) or **full_rerun** (delete all
    sprint outputs, re-run seo-strategist from scratch)

### Approval Listener (`callback-listener.js`)
- Must be running as a background process for Telegram buttons to work:
  ```bash
  node callback-listener.js &
  ```
- Long-polls Telegram for `callback_query` (button clicks) and `message` (text replies)
- Routes button clicks to `approval-bridge.js`
- Routes force_reply text replies to `approval-bridge.js` with feedback text
- Validates force_reply responses using `message.reply_to_message.message_id`
- Writes logs to `outputs/logs/callback-listener.log`

### Approval Bridge (`approval-bridge.js`)
- Stateless Node.js script called by `callback-listener.js`
- Handles: `approve`, `revise`, `reject`, `sprint-feedback`, `proceed`, `adjust`
- On **revise/reject**: sends `force_reply` Telegram message via Telegram API (curl), writes
  `outputs/seo-strategist/pending-text-reply.json` to track which sprint is awaiting feedback
- On **sprint-feedback**: writes `outputs/seo-strategist/sprint-feedback.json`, fires openclaw event to trigger
  `review-sprint-feedback/orchestrator.md`
- On **approve**: writes `outputs/seo-strategist/sprint-approval.json` status=`approved`, fires openclaw event to trigger
  `post-approval/orchestrator.md`

### Review Sprint Feedback (`review-sprint-feedback/`)
- Triggered by `approval-bridge.js` after feedback text is received
- Step 1: `evaluate-sprint-feedback` agent reads `sprint-plan.json` + `sprint-feedback.json`,
  decides reform vs full_rerun, writes `sprint-feedback-decision.json`
- **reform path**: `reform-sprint-plan` → `generate-sprint-pdf` → `deliver-sprint-plan`
- **full_rerun path**: deletes all sprint outputs → fires openclaw event → seo-strategist re-runs fresh

### Content Pipeline (`content-pipeline/`)
- **Runner:** `node run-content-pipeline.js --sprint-id <id> --task-id <n>`
- **5-step pipeline:** Content Strategist → Content Writer → Content Editor (revision loop, max 2) →
  Graphics Designer → HTML Preview Generator
- Each step runs as an isolated `sessions_spawn` subagent under `agentId: content-pipeline`
- **Resume from step:** `--from strategist|writer|editor|graphics|preview`
- **Outputs:** `pipeline-context-[task_id].json` (input), `pipeline-result-[task_id].json` (output),
  `content-brief-[slug].json`, `draft-[slug].md`, `edited-draft-[slug].md`, `image-prompts-[slug].json`,
  `preview-[slug].html`
- **Human gate:** Sends PDF preview + [✅ Approve] [🔄 Revise] [❌ Reject] to Telegram. Writes
  `content-approval-[sprint_id].json` with status `pending_review`.

### Publishing Agent (`publishing-agent/`)
- **Runner:** `node run-publishing-agent.js --sprint-id <id> --slug <slug>`
- Triggered automatically by `content-approval-bridge.js` when APPROVE received
- Verifies approval status in `content-approval-[sprint_id].json` before proceeding
- In MOCK: writes `publish-log-[sprint_id].json`, marks task Done in `sprint-tasks-[sprint_id].json`
- **After publish:** writes `social-media-trigger-[sprint_id].json`, then spawns `run-social-media.js`
  as a detached background process

### Social Media Engine (`social-media/`)
- **Runner:** `node run-social-media.js --sprint-id <id> --slug <slug>`
- Triggered automatically by Publishing Agent after publish
- Requires `social-media-trigger-[sprint_id].json` to exist before running
- **6-step pipeline:** Aggregation → Idea Bank → Telegram idea approval → Create posts →
  Per-post Telegram approval → Schedule via SocialPilot API (or manual queue for Reddit/Quora)
- In MOCK: all ideas and posts auto-approved; generates fictional news items
- Cap: max 12 posts/month per website

### Sprint PM (`sprint-pm/`)
- **Runner:** `node run-sprint-pm.js --sprint-id <id>`
- **Trigger:** daily overnight cron (`node run-sprint-pm.js`)
- Calculates sprint day (day 1–10), reads `sprint-tasks-[sprint_id].json`, dispatches
  `technical-seo`, `off-page-seo`, `content-pipeline` execution agents for today's tasks
- Requires `sprint-approval.json` with `status: "approved"` and `sprint-tasks-[sprint_id].json`

### Content Approval Bridge (`content-approval-bridge.js`)
- Must be running as a background process to handle Telegram APPROVE/REVISE/REJECT on content:
  ```bash
  node content-approval-bridge.js &
  ```
- Polls OpenClaw session JSONL files for `content_approve|`, `content_revise|`, `content_reject|` callbacks
- On **approve**: triggers `run-publishing-agent.js`
- On **revise**: re-runs `run-content-pipeline.js --from editor`
- On **reject**: marks task Rejected in sprint tasks JSON
- Writes state to `outputs/logs/content-approval-bridge-state.json` and logs to `outputs/logs/content-approval-bridge.log`

### Product Owner Review (`product-owner/`)
- Part of `post-approval/orchestrator.md` — runs as Steps 1–5
- Scans live website, validates business alignment, checks competitor claims, enriches sprint plan with product context, applies CANNOT/FLAG guardrails
- Config: `product-owner/biztechcs-product-owner-config.md`
- Writes to: `outputs/post-approval/` (website-scan, alignment-check, competitor-claims-check, enriched-sprint-plan, guardrails-check, product-owner-review)

### Business Layer (`business-layer/`)
- Part of `post-approval/orchestrator.md` — runs as Steps 6–10
- Checks quota compliance, goal alignment, MQL/SQL performance, topic territory, builds tiered sprint options
- Config: `business-layer/biztechcs-business-config.md`
- Writes to: `outputs/post-approval/` (quota-check, goal-alignment, mql-check, topic-territory-check, tiered-sprint-options)
- Human gate: Telegram message with tiered task list → POC replies GO

### Task Sheet Populator (`task-sheet-populator/`)
- Triggered after POC GO via `post-approval/orchestrator.md`
- Reads `sprint-plan.json` + `tiered-sprint-options.json`, builds 10-day task schedule
- Writes `outputs/sprint-pm/sprint-tasks-[sprint_id].json` + `.csv`
- Google Sheets API not yet wired — local JSON only

## Inter-Agent Data Contract

`outputs/intelligence-report/report-summary.json` is the primary handoff between Intelligence Report and SEO Strategist.
Key fields the Strategist reads:
- `priority_1_pages` — GSC downtrending pages, locked as P1 inputs
- `performance_context` — plain-language MQL/SQL variance explanation
- `algorithm_status.sprint_interrupt_required` — if `true`, pipeline halts for human decision
- `research_findings` — Q1–Q20 structured findings from `run-20-questions`

## Output File Map (current pipeline)

Outputs are organized into per-pipeline subdirectories. Backup of previous run: `old-outputs/`.

**`outputs/intelligence-report/`**
| File | Written by |
|------|-----------|
| `gsc-findings.json` | `pull-gsc-data` |
| `ga4-findings.json` | `pull-ga4-data` |
| `ranking-findings.json` | `pull-ranking-data` |
| `odoo-findings.json` | `pull-odoo-leads` |
| `clarity-findings.json` | `pull-clarity-data` |
| `competitor-findings.json` | `competitor-monitor` |
| `algorithm-findings.json` | `algorithm-signals` |
| `analysis-findings.json` | `analyze-data` |
| `research-findings.json` | `run-20-questions` |
| `competitor-position-table.json` | `run-20-questions` Q10 |
| `insights.json` | `generate-insights` |
| `report-summary.json` | `assemble-report` (primary handoff to SEO Strategist) |
| `intelligence-report.md` | `assemble-report` |
| `intelligence-report.html` | `assemble-report` |
| `generate-pdf-status.json` | `generate-pdf` |
| `report-approval.json` | `deliver-report` |

**`outputs/seo-strategist/`**
| File | Written by |
|------|-----------|
| `intelligence-brief-parsed.json` | `read-intelligence-brief` (Step 1) |
| `attack-vectors.json` | `identify-attack-vectors` (Step 2) |
| `content-plan.json` | `build-content-offensive` (Step 3a) |
| `technical-plan.json` | `build-technical-offensive` (Step 3b) |
| `offpage-plan.json` | `build-offpage-offensive` (Step 3c) |
| `expert-intelligence-map.json` | `build-expert-intelligence-map` (Step 4e) |
| `history-rationale.json` | `build-history-rationale` (Step 4f) |
| `sprint-plan.json` | `assemble-sprint-plan` (Step 4) |
| `sprint-plan.md` | `assemble-sprint-plan` (Step 4) |
| `sprint-plan.html` | `assemble-sprint-plan` → enriched by `enrich-sprint-plan` (Step 4g) |
| `generate-sprint-pdf-status.json` | `generate-sprint-pdf` (Step 5) |
| `sprint-approval.json` | `deliver-sprint-plan` → updated by `approval-bridge.js` |
| `sprint-feedback.json` | `approval-bridge.js` (on REVISE/REJECT) |
| `sprint-feedback-decision.json` | `evaluate-sprint-feedback` |
| `pending-text-reply.json` | `approval-bridge.js` (temp — deleted after reply) |
| `post-approval-trigger.json` | `approval-bridge.js` (on APPROVE) |
| `review-sprint-trigger.json` | `approval-bridge.js` (on feedback) |

**`outputs/post-approval/`**
| File | Written by |
|------|-----------|
| `website-scan.json` | `scan-website` (PO Step 1) |
| `alignment-check.json` | `validate-business-alignment` (PO Step 2) |
| `competitor-claims-check.json` | `check-competitor-claims` (PO Step 3) |
| `enriched-sprint-plan.json` | `enrich-with-product-context` (PO Step 4) |
| `guardrails-check.json` | `apply-guardrails` (PO Step 5) |
| `product-owner-review.json` | `produce-review-output` (PO Step 6) |
| `quota-check.json` | `check-quota-compliance` (BL Step 1) |
| `goal-alignment.json` | `check-goal-alignment` (BL Step 2) |
| `mql-check.json` | `check-mql-sql-performance` (BL Step 3) |
| `topic-territory-check.json` | `check-topic-territory` (BL Step 4) |
| `tiered-sprint-options.json` | `build-tiered-options` (BL Step 5) |
| `project-cost.json` | `calculate-project-cost` |
| `post-approval-status.json` | `deliver-validated-plan` |
| `task-sheet-trigger.json` | `deliver-validated-plan` |

**`outputs/sprint-pm/`**
| File | Written by |
|------|-----------|
| `sprint-tasks-[sprint_id].json` | `task-sheet-populator` |
| `sprint-tasks-[sprint_id].csv` | `task-sheet-populator` |
| `sprint-pm-log-[date].json` | `sprint-pm` (daily) |
| `technical-brief-[slug].md` | `technical-seo` subagent |
| `technical-changes-[date].md` | `technical-seo` subagent |

**`outputs/content-pipeline/`**
| File | Written by |
|------|-----------|
| `pipeline-context-[task_id].json` | `run-content-pipeline.js` (input seed) |
| `pipeline-result-[task_id].json` | `content-pipeline` agent (final step) |
| `content-brief-[slug].json` | `content-strategist` (Step 1) |
| `draft-[slug].md` | `content-writer` (Step 2, overwritten on revision) |
| `edited-draft-[slug].md` | `content-editor` (Step 3 PASS) |
| `revision-brief-[slug].md` | `content-editor` (Step 3 FAIL) |
| `image-prompts-[slug].json` | `graphics-designer` (Step 4) |
| `preview-[slug].html` | `html-preview` (Step 5) |
| `content-approval-[sprint_id].json` | `run-content-pipeline.js` (one entry per article) |

**`outputs/publishing-agent/`**
| File | Written by |
|------|-----------|
| `publish-log-[sprint_id].json` | `publishing-agent` |
| `social-media-trigger-[sprint_id].json` | `publishing-agent` (triggers social engine) |
| `announcement-[sprint_id].txt` | `publishing-agent` |
| `approved/preview-[slug].html` | `publishing-agent` (archived after publish) |

**`outputs/social-media/`**
| File | Written by |
|------|-----------|
| `social-posts-[sprint_id].json` | `social-media` agent |
| `social-manual-queue-[sprint_id].md` | `social-media` agent (Reddit/Quora) |
| `outreach-package-[sprint_id].json` | `off-page-seo` subagent |
| `outreach-log-[sprint_id].json` | `outreach-manager` subagent |
| `linkedin-draft-[slug].md` | `social-media` agent |

**`outputs/logs/`**
| File | Written by |
|------|-----------|
| `callback-listener.log` | `callback-listener.js` |
| `callback-listener-offset.json` | `callback-listener.js` |
| `content-approval-bridge.log` | `content-approval-bridge.js` |
| `content-approval-bridge-state.json` | `content-approval-bridge.js` |
| `session-bridge.log` | `session-bridge.js` |
| `algorithm-event-log.json` | `algorithm-intelligence` (appends each cycle) |

## Deployment Topology

- **Machine 1:** BiztechCS (9 PM cron) + AppJetty (12:30 AM cron)
- **Machine 2:** PrintXpand (9 PM cron) + CRMJetty (12:30 AM cron)
- Intelligence Report: biweekly (1st + 16th at 6 AM)
- Sprint PM: daily overnight cron (`node run-sprint-pm.js`)

## Per-Website Configuration (in OpenClaw memory, not in repo)

Two config files per website (8 total):
- `[website]-product-owner-config.md` — ICP, messaging guardrails, named authors for E-E-A-T,
  active priorities, CANNOT/FLAG rules
- `[website]-business-config.md` — annual goals ÷ 26 sprints, content quotas per sprint,
  Telegram POC user IDs, seasonality weights

All agent `.md` files are site-agnostic. Website-specific context is injected at runtime via
OpenClaw memory.

## Known Issues / Tech Debt

- `node_modules/` is checked into the repo — add it to `.gitignore` and run `npm install` on
  fresh clone instead.
- Workspace path is hardcoded to `/home/sachin.p/.openclaw/workspace` in all runner scripts.
  Should be an environment variable or derived from `openclaw config`.
- The `## Model` field in orchestrator `.md` files is not enforced by the JS runners —
  the `MODEL` constant in each runner file is what actually gets called.
- `.claude/settings.local.json` only permits `Bash(openclaw config *)`. This will block
  Claude Code from running `node run-pipeline.js` etc. Add appropriate permissions if using
  Claude Code to operate the pipeline.
- Two background processes must be running for Telegram callbacks to work:
  - `node callback-listener.js &` — handles sprint approve/revise/reject buttons
  - `node content-approval-bridge.js &` — handles content approve/revise/reject buttons
  Neither is started automatically — add both to launchd/systemd alongside the cron pipelines.
- Telegram 409 conflict: if another process (openclaw agent or a second listener instance) also
  polls `getUpdates` on the same bot token, the listener gets 409 errors. Kill duplicate processes
  before starting `callback-listener.js`.
- `sendTelegramForceReply` in `approval-bridge.js` uses `curl` to call the Telegram API directly
  (needed for `force_reply` markup which `openclaw message send` does not support).
- Google Sheets API not wired — `task-sheet-populator` writes local JSON/CSV only. Phase 7 covers this.
- Google Drive API not wired — all outputs are local. Reports/content not saved to Drive yet.
- CMS publish API not wired — `publishing-agent` writes a mock publish log only.
- SocialPilot API not wired — `social-media` engine auto-approves and writes to manual queue only.
- Content pipeline end-to-end (content → Telegram approval → publish → social) not yet fully validated with new output paths. Run Phase 0 first.

## Key Reference Documents

- `GUIDE.md` — complete build plan: what exists, what to build, in what order, with all specs
- `plan.md` — full implementation roadmap with phase breakdown
- `LEARNING.txt` — running notes on what worked, what broke, and lessons learned
- `COMMANDS.txt` — reference list of all CLI commands used
- `Concept from Parth.md` — original vision document with architecture diagrams