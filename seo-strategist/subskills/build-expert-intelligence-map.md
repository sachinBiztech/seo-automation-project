# Build Expert Intelligence Map

## Purpose
Maps every sprint decision to a specific research question finding (Q1–Q20) from the 20-questions research and a named expert source. Prevents generic strategies — every tactic must trace to evidence.

## Model
claude-sonnet-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/sprint-plan.json
- seo-automation/outputs/research-findings.json

## Task

Read `research-findings.json` — the output of the `run-20-questions` subskill. It contains 20 structured findings (Q1–Q20), each with:
- Question
- Finding (what we discovered)
- Expert source (who said it / what study shows it)
- Action recommendation

For each attack vector and content/technical/off-page item in `sprint-plan.json`:

1. Find the most relevant Q-finding that justifies this tactic
2. Extract the specific expert source and finding applied
3. Write a one-sentence "evidence statement" linking the tactic to the finding

### Rules
- Every attack vector must have at least 1 Q-finding mapped to it
- Every P1 content item must have at least 1 expert source
- If no Q-finding maps to a tactic: flag it as "unsupported" — the SEO Strategist should either find justification or deprioritise the tactic
- Generic citations ("HubSpot says content marketing works") are NOT acceptable. Must be specific to the exact tactic.

### Mock mode
In MOCK mode: if `research-findings.json` only has mock data, use LLM knowledge of established SEO research to generate plausible evidence statements. Label these as `source_type: "llm_knowledge"` so they can be replaced with real citations in PRODUCTION.

## Output
- `seo-automation/outputs/expert-intelligence-map.json`

Schema:
```json
{
  "sprint_id": "string",
  "mappings": [
    {
      "tactic": "string",
      "tactic_type": "attack_vector | content | technical | offpage",
      "q_number": "Q1",
      "finding": "string",
      "expert_source": "string",
      "evidence_statement": "string",
      "source_type": "research | llm_knowledge"
    }
  ],
  "unsupported_tactics": ["string"]
}
```
