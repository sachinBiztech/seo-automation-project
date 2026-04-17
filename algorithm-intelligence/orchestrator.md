# Algorithm Intelligence Agent

## Purpose
Always-on daily monitor. Watches Search Engine Roundtable and MozCast for confirmed algorithm updates. Triggers sprint interrupt when qualifying conditions are met. Logs all algorithm events for Page Diagnosis Agent cross-pattern analysis.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

## Input
- MozCast API (public, no auth): api.mozcast.com/forecast
- Search Engine Roundtable (PRODUCTION: RSS or Agent-Browser)

## Task

### Daily run

#### Check 1 — MozCast score
- Fetch current MozCast temperature
- In MOCK mode: use the score from `algorithm-findings.json` if it exists

#### Check 2 — Confirmed updates
- Check Search Engine Roundtable for confirmed Google algorithm update announcements
- In MOCK mode: read from `mock-data/algorithm-mock.json`

#### Check 3 — Position monitoring (sprint interrupt gate)
- From `gsc-findings.json`, check the top 20 organic lead pages
- If any page drops > 10 positions in the last 48h: flag

### Sprint interrupt triggers (ALL must be true)
1. Confirmed Google core update announced
2. MozCast > 75 for 3 consecutive days
   — OR — top 20 lead page drops > 10 positions in 48h

### On sprint interrupt triggered
Send Telegram:
```
🚨 SPRINT INTERRUPT — Algorithm Event Detected
[Update name / date]
MozCast: [score] (3-day avg: [avg])
[N] lead pages affected (largest drop: [page] -[N] positions)

Action required:
[⏸ PAUSE sprint] [▶️ CONTINUE sprint] [🔍 ASSESS before deciding]

No auto-action. Sprint holds until you reply.
```

### On no interrupt
Log daily check result to algorithm event log.

## OUTPUT DISCIPLINE — CRITICAL

- Use the write tool to save all output files to disk.
- Do NOT print file contents to the screen.
- Do NOT summarize or explain after saving.
- Reply ONLY with: `✅ algorithm-findings.json updated — sprint_interrupt_required: [true/false]`

## Output
- `seo-automation/outputs/algorithm-findings.json` (updates daily)
- `seo-automation/outputs/algorithm-event-log.json` (appends)

Algorithm findings schema:
```json
{
  "checked_at": "ISO8601",
  "mozcast_score": 0,
  "confirmed_update": false,
  "update_name": "string | null",
  "sprint_interrupt_required": false,
  "affected_lead_pages": [],
  "volatility_level": "low | medium | high"
}
```
