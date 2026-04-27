# Subskill: algorithm-signals

## Purpose
Check for active Google algorithm updates and assess volatility risk
for the current sprint.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK — read from local mock file

---

## Input

File: `seo-automation/mock-data/algorithm-signals-mock.json`

---

## Task

You are an algorithm monitoring agent for BiztechCS.

Read `seo-automation/mock-data/algorithm-signals-mock.json` completely.

Then produce the output file by extracting and carrying forward:
- `active_updates` array (copy as-is)
- `mozcast_score` value
- `volatility_level` value
- `sprint_interrupt_required` boolean
- `serp_observations` (copy as-is if present)
- Build a `notes` string: summarise the sprint interrupt assessment and any SERP observation highlights in 2–3 sentences.

In PRODUCTION mode, this subskill will:
- Check Search Engine Roundtable RSS feed
- Pull MozCast volatility score
- Flag confirmed updates affecting our vertical

---

## Output

Create the file `seo-automation/outputs/intelligence-report/algorithm-findings.json` and write
the complete JSON below before finishing.

```json
{
  "site": "BiztechCS",
  "checked_at": "<today's date YYYY-MM-DD>",
  "mode": "mock",
  "active_updates": [],
  "mozcast_score": 0,
  "volatility_level": "<normal|elevated|high>",
  "sprint_interrupt_required": false,
  "serp_observations": {},
  "notes": "<2-3 sentence summary from sprint_interrupt_assessment and serp_observations>",
  "next_real_check": "Replace this subskill with live Search Engine Roundtable RSS + MozCast API call in Phase 5."
}
```

Populate all fields from the mock file. Do not leave any field at its default if the mock file contains better data.
