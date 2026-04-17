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

# Content pipeline
node run-content-pipeline.js

# Publishing agent
node run-publishing-agent.js
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

The full build plan is in `GUIDE.md`. Current state:

```
Intelligence Report (mock) → SEO Strategist (mock) → [not built]
```

Target state:
```
Intelligence Report → SEO Strategist → Product Owner Review → Business Layer
  → Task Sheet Populator → Sprint PM → Execution Agents → Social Media Engine
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
- **Runner:** `node run-pipeline.js`
- Reads `outputs/report-summary.json`
- Produces 15-day sprint plan across 3 attack vectors: Content, Technical, Off-Page
- **Core principle:** Every plan answers *"What structural advantage can we create in 15 days?"*

### Product Owner Review, Business Layer, Task Sheet Populator, Sprint PM, Execution Agents
Not yet built. See `GUIDE.md` for full specs.

## Inter-Agent Data Contract

`outputs/report-summary.json` is the primary handoff between Intelligence Report and SEO Strategist.
Key fields the Strategist reads:
- `priority_1_pages` — GSC downtrending pages, locked as P1 inputs
- `performance_context` — plain-language MQL/SQL variance explanation
- `algorithm_status.sprint_interrupt_required` — if `true`, pipeline halts for human decision
- `research_findings` — Q1–Q20 structured findings from `run-20-questions`

## Output File Map (current pipeline)

| File | Written by |
|------|-----------|
| `outputs/gsc-findings.json` | `pull-gsc-data` |
| `outputs/ga4-findings.json` | `pull-ga4-data` |
| `outputs/ranking-findings.json` | `pull-ranking-data` |
| `outputs/odoo-findings.json` | `pull-odoo-leads` |
| `outputs/competitor-findings.json` | `competitor-monitor` |
| `outputs/algorithm-findings.json` | `algorithm-signals` |
| `outputs/analysis-findings.json` | `analyze-data` |
| `outputs/research-findings.json` | `run-20-questions` |
| `outputs/insights.json` | `generate-insights` |
| `outputs/report-summary.json` | `assemble-report` |
| `outputs/intelligence-report.md` | `assemble-report` |
| `outputs/report-approval.json` | `deliver-report` |

## Deployment Topology

- **Machine 1:** BiztechCS (9 PM cron) + AppJetty (12:30 AM cron)
- **Machine 2:** PrintXpand (9 PM cron) + CRMJetty (12:30 AM cron)
- Intelligence Report: biweekly (1st + 16th at 6 AM)
- Sprint PM: daily overnight cron (`node sprint-pm.js`)

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

## Key Reference Documents

- `GUIDE.md` — complete build plan: what exists, what to build, in what order, with all specs
- `plan.md` — full implementation roadmap with phase breakdown
- `LEARNING.txt` — running notes on what worked, what broke, and lessons learned
- `COMMANDS.txt` — reference list of all CLI commands used
- `Concept from Parth.md` — original vision document with architecture diagrams