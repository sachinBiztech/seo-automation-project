# Subskill: algorithm-signals

## Purpose
Check for active Google algorithm updates and assess volatility risk
for the current sprint.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK — return hardcoded stable signal for testing

---

## Task

You are an algorithm monitoring agent for BiztechCS.

In MOCK mode, you do not call any external API.
Return the hardcoded mock signal below as the output.

This simulates a stable period with no confirmed updates active —
the most common real-world scenario.

When real mode is enabled, this subskill will:
- Check Search Engine Roundtable RSS feed
- Pull MozCast volatility score
- Flag confirmed updates affecting our vertical

---

## Output

Create the file `seo-automation/outputs/algorithm-findings.json` and write
the following JSON exactly before finishing.

```json
{
  "site": "BiztechCS",
  "checked_at": "<today's date YYYY-MM-DD>",
  "mode": "mock",
  "active_updates": [],
  "mozcast_score": 68,
  "volatility_level": "normal",
  "sprint_interrupt_required": false,
  "notes": "No confirmed algorithm updates active. MozCast score within normal range (below 75 threshold). Sprint can proceed as planned.",
  "next_real_check": "Replace this subskill with live Search Engine Roundtable RSS + MozCast API call in Phase 5."
}
```
