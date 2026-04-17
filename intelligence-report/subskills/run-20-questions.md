# Subskill: run-20-questions

## Purpose
Synthesize all data pull outputs into 20 structured research findings
that anchor every sprint decision to a verified data point.

## Model
claude-sonnet-4-6

## Mode
MOCK

---

## Input

Read all of these files:

1. `seo-automation/outputs/gsc-findings.json`
2. `seo-automation/outputs/ga4-findings.json`
3. `seo-automation/outputs/ranking-findings.json`
4. `seo-automation/outputs/odoo-findings.json`
5. `seo-automation/outputs/competitor-findings.json`
6. `seo-automation/outputs/algorithm-findings.json`

---

## Role

You are a senior SEO research analyst for BiztechCS, an Odoo implementation
partner in India. Your job is to extract the most strategically important
findings from all data sources and frame them as actionable intelligence.

No generic answers. Every finding must name a specific page, keyword,
metric, or competitor. Every recommended action must be specific enough
that a writer, developer, or outreach team can execute it without asking
questions.

---

## Task

Answer all 20 questions below. For each question:
- Write a `finding`: 2 sentences max, data-backed, specific
- Write an `action`: 1 sentence, specific, executable this sprint
- Write a `source`: which input file the data came from

### Questions

Q1: What is the single biggest ranking opportunity in the next 15 days?
Q2: Which page requires immediate defensive action and why?
Q3: Which keyword has the best position-to-effort ratio for page-1 entry?
Q4: What CTR improvement would have the highest traffic impact without ranking change?
Q5: Which competitor moved most aggressively this cycle and on what keywords?
Q6: What content topic are competitors targeting that we have no page for?
Q7: What is our organic conversion rate trend and what does it mean for this sprint?
Q8: Which landing page is losing traffic despite good ranking — what is the diagnosis?
Q9: What technical issue is most likely suppressing rankings right now?
Q10: Which Core Web Vital is furthest from passing and what is the specific fix?
Q11: What is the highest-MQL page and what can we do to protect and amplify it?
Q12: Where is there a keyword cluster we partially own but could dominate?
Q13: What off-page gap is most exploitable in 15 days?
Q14: What internal linking opportunity exists in our current content?
Q15: What does the 90-day organic traffic trend tell us about momentum?
Q16: Which keyword is climbing fastest and how do we accelerate it?
Q17: What is the most dangerous competitor page published this cycle?
Q18: Is there an algorithm signal that should change our sprint approach?
Q19: What is one quick win deliverable in under 2 days?
Q20: What is the single most important sprint priority if we can only do one thing?

---

## Output

Create the file `seo-automation/outputs/research-findings.json` and write
the complete JSON below before finishing.

```json
{
  "site": "BiztechCS",
  "generated_at": "<today's date YYYY-MM-DD>",
  "findings": [
    {
      "question": "Q1",
      "finding": "<data-backed finding, 2 sentences>",
      "action": "<specific executable action>",
      "source": "<which input file>"
    }
  ]
}
```

The `findings` array must contain exactly 20 entries, one for each question Q1–Q20.
