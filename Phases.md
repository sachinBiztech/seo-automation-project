# SEO Automation Engine — Phase Status & Roadmap

Good. I have a complete picture now. Here's the full honest assessment.

---

## Where You Are vs Parth's Concept

The concept describes an 8-phase autonomous engine. Here's the exact status:

| Phase | What Parth Envisioned | Status |
|---|---|---|
| 1 — Data Layer | Real APIs: GA4, GSC, Odoo, Clarity, Ahrefs | MOCK only — all 7 data pulls read fake JSON |
| 2 — Intelligence Report | PDF → Drive + Odoo email → Telegram | MOCK done — Drive/email not wired |
| 3 — SEO Strategist + Approval loop | Sprint plan → Telegram → Approve/Revise/Reject | DONE — fully tested |
| 3B/3C — Product Owner + Business Layer | Validate alignment, quota, tiered tasks | DONE — fully tested |
| 4 — Task Sheet + Sprint PM | Google Sheets auto-populated, 10-day schedule | Sheets not wired — JSON local only. Sprint PM built, not run yet |
| 5 — Execution Agents | Technical SEO, Content pipeline, Off-Page | BUILT — not run end-to-end yet |
| 6 — Social Media Engine | SocialPilot scheduling | MOCK built — SocialPilot not wired |
| 7 — Drive + Sheets Infrastructure | All outputs logged to Drive | NOT BUILT — Drive API not wired |
| 8 — Watch Agents | Algorithm, Best Practices, Competitor Watch | BUILT — not run |

**Your workflow is correct.** The architecture matches the concept exactly. The gap is: mock → production (real APIs).

---

## Step-by-Step: What To Do Now

### Step 1 — Run Sprint PM Day 1 (do this now, ~10 min)

This validates the execution layer for the first time.

```bash
node run-sprint-pm.js --sprint-id biztechcs_sprint_2026-04-27
```

Expected outputs:
- `technical-changes-2026-04-27.md` (Technical SEO agent)
- `outreach-package-biztechcs_sprint_2026-04-27.json` (Off-Page agent)
- `outreach-log-biztechcs_sprint_2026-04-27.json` (Outreach Manager)
- Updated sprint-tasks JSON (statuses → In Progress)
- Telegram message: "✅ Sprint PM Day 1 complete"

---

### Step 2 — Run Content Pipeline (Days 2–6, one article at a time)

3 content tasks are scheduled on Days 2, 4, 6. Test with Task 5 first:

```bash
node run-content-pipeline.js --sprint-id biztechcs_sprint_2026-04-27 --task-id 5
```

This runs: Strategist → Writer → Editor → Graphics → HTML Preview → Telegram approval.

---

### Step 3 — Test Publishing + Social (mock end-to-end)

After content is approved in Telegram:

```bash
node run-publishing-agent.js --sprint-id biztechcs_sprint_2026-04-27 --slug <slug>
# Publishing agent auto-triggers social media engine
```

This completes one full cycle of the content pipeline in mock — the biggest untested part.

---

### Step 4 — Wire Real APIs (this is the production upgrade)

Do these in order of impact:

| Priority | Integration | Why First |
|---|---|---|
| 1 | Google Sheets API | Task sheet is currently local JSON only — team can't see it |
| 2 | GSC → BigQuery | Highest-value data source for the Intelligence Report |
| 3 | GA4 → BigQuery | Sessions, conversions, organic share |
| 4 | Odoo XML-RPC | Leads/MQLs/SQLs — business layer depends on this |
| 5 | Google Drive API | All outputs need to go to Drive before publishing |
| 6 | CMS Publish API | Publishing Agent is mock-only without this |
| 7 | SocialPilot API | Social engine writes to manual queue without this |
| 8 | Clarity, Ahrefs, SerpAPI | Competitive intelligence layer |

---

### Step 5 — Set Up Production Crons

Once APIs are wired and one full sprint runs clean:

```bash
# Intelligence Report: 1st + 16th of month at 6AM
# Sprint PM: daily at 9PM (BiztechCS on Machine 1)
# callback-listener.js + content-approval-bridge.js — always running
```

---

## Honest Summary

The agent workflow is correct and validated through the strategy layer. The execution layer (Sprint PM → content pipeline → publish → social) needs one clean end-to-end run in mock before you touch any real APIs. That's Steps 1–3 above.

Next unblocked action: run Sprint PM Day 1 — one command, ~10 minutes.
