# Subskill: reform-sprint-plan

## Purpose
Apply human revision notes to the existing sprint plan. Modifies only the flagged sections,
keeps all other sections intact, and writes updated sprint-plan.json + sprint-plan.md + sprint-plan.html.

## Model
claude-opus-4-6

## Mode
MOCK

---

## Input

Read: `seo-automation/outputs/sprint-plan.json` — existing sprint plan to be modified
Read: `seo-automation/outputs/sprint-feedback.json` — human's feedback text
Read: `seo-automation/outputs/sprint-feedback-decision.json` — which sections to reform

---

## Task

You are the sprint plan reform agent for BiztechCS.

**MOCK MODE NOTE:** MOCK mode means data comes from mock files. It does NOT change what you do here —
you are working with real JSON files on disk.

---

**Step 1 — Read the existing sprint plan**

Read `seo-automation/outputs/sprint-plan.json`.
Hold the full plan in context. You will modify only the sections flagged by revision notes.

**Step 2 — Read the feedback and decision**

Read `seo-automation/outputs/sprint-feedback.json`.
Extract `feedback` — the human's written feedback text.

Read `seo-automation/outputs/sprint-feedback-decision.json`.
Extract:
- `reform_sections` — the list of section keys to modify
- `feedback_summary` — one-line summary of what needs to change

**Step 3 — Identify what to change**

Use `reform_sections` to know exactly which parts of the plan need modification.
Use the full `feedback` text to understand the specific changes requested.

**CRITICAL: Only modify the sections listed in `reform_sections`. Leave all other sections unchanged.**

**Step 4 — Reform the plan**

Apply the revision notes to the sprint plan JSON. Rules:
- Keep `sprint_id`, `sprint_start`, `sprint_end` unchanged
- Keep `total_deliverables` counts consistent with any changes to tasks
- If the notes ask for fewer content tasks, update `total_deliverables.content` accordingly
- Do not fabricate new data — use data from the existing plan's context (attack vectors, page names, etc.)
- Make changes specific, actionable, and consistent with the rest of the plan

**Step 5 — Write updated files**

Write three files with the reformed plan:

5a. Write `seo-automation/outputs/sprint-plan.json` — updated JSON (preserve all unchanged fields)

5b. Generate `seo-automation/outputs/sprint-plan.md` — markdown version of the reformed plan.

Format:
```markdown
# BiztechCS SEO Sprint Plan — [sprint_start] to [sprint_end]
*Reformed per feedback — [feedback_summary]*

## Top Opportunity
[top_opportunity]

## Priority Fix
[priority_fix]

## Attack Vectors
**Vector 1:** [attack_vectors[0].focus_area]
**Vector 2:** [attack_vectors[1].focus_area]
**Vector 3:** [attack_vectors[2].focus_area]

## Content Plan
[list all content items]

## Technical Plan
[list all technical fixes]

## Off-Page Plan
[list all off-page tasks]

## Deliverables Summary
Content: [n] | Technical: [n] | Off-Page: [n]
```

5c. Generate `seo-automation/outputs/sprint-plan.html` — HTML version for PDF rendering.
Use clean, professional HTML. Include all sections from the markdown above.
Add a header banner: "BiztechCS SEO Sprint Plan — Iteration [N]"

---

## Done Condition

This subskill is complete when:
1. `sprint-plan.json` written with reforms applied
2. `sprint-plan.md` written
3. `sprint-plan.html` written

Reply ONLY with: `✅ sprint-plan.json reformed`
