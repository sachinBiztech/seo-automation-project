# Subskill: read-intelligence-brief

## Purpose
Parse report-summary.json from the Intelligence Report and extract
all strategic inputs the SEO Strategist needs to build the sprint plan.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

---

## Input

File 1: `seo-automation/outputs/report-summary.json`
File 2: `seo-automation/outputs/gsc-findings.json`
File 3: `seo-automation/outputs/research-findings.json`

---

## Task

You are the intelligence brief parser for BiztechCS.

Read all three input files completely before extracting anything.

**Step 1 — Priority 1 Locked Pages**
Read `gsc-findings.json` and extract the `priority_1_pages` array.
These pages are locked as Priority 1 for the sprint — the strategist cannot deprioritize them.
Each entry has: `url`, `signal` (why it is priority 1), and optionally `priority`.
Map `signal` → `signal` and derive `action_required` from the signal text.

**Step 2 — Top Opportunities**
Read `research-findings.json`. It has a `findings` array where each entry has `question`, `finding`, `action`.
Extract entries where `question` is Q1, Q3, Q12, Q16.
These are the primary attack opportunities.

**Step 3 — Technical Flags**
From `research-findings.json` `findings` array, extract entries where `question` is Q9 and Q10.
From `report-summary.json` `traffic_summary`, note `traffic_trend`.

**Step 4 — Competitor Threats**
From `report-summary.json` `competitor_summary`, extract `highest_threat` and `top_content_gap`.
From `research-findings.json` `findings` array, extract entries where `question` is Q5, Q6, Q17.

**Step 5 — MQL Context**
From `report-summary.json` `lead_summary`, extract `performance_flag`.
From `report-summary.json` `performance_context`, copy the full text.
This context must be passed to the Business Layer to prevent misreading.

---

## Output

Create the file `seo-automation/outputs/intelligence-brief-parsed.json`
and write the complete JSON below before finishing.

```json
{
  "site": "BiztechCS",
  "report_id": "<copy from report-summary.json>",
  "parsed_at": "<today's date YYYY-MM-DD>",
  "priority_1_locked": [
    {
      "url": "<page url>",
      "signal": "<why priority 1>",
      "action_required": "<what to do>"
    }
  ],
  "top_opportunities": [
    {
      "source_question": "Q1",
      "finding": "<finding text>",
      "action": "<action text>"
    }
  ],
  "technical_flags": [
    {
      "source_question": "Q9",
      "finding": "<finding text>",
      "action": "<action text>"
    }
  ],
  "competitor_threats": {
    "highest_threat_domain": "<domain>",
    "content_gap_to_fill": "<topic>",
    "key_findings": ["<Q5 finding>", "<Q6 finding>", "<Q17 finding>"]
  },
  "mql_context": {
    "performance_flag": "above_target|on_track|below_target",
    "context_note": "<copy performance_context from report-summary>"
  }
}
```
