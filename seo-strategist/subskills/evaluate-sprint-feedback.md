# Subskill: evaluate-sprint-feedback

## Purpose
Read the human's feedback on the sprint plan and decide whether to:
- **reform**: apply targeted changes to specific sections (feedback is about specific tasks, priorities, counts)
- **full_rerun**: discard the plan and regenerate from scratch (feedback indicates wrong strategy, wrong pages, wrong attack vectors)

## Model
claude-opus-4-6

## Mode
MOCK

---

## Input

Read: `seo-automation/outputs/sprint-plan.json` — the plan being evaluated
Read: `seo-automation/outputs/sprint-feedback.json` — human's feedback

---

## Task

**Step 1 — Read sprint-plan.json**

Read the current sprint plan. Understand its attack vectors, content tasks, technical fixes,
off-page tasks, and overall strategic direction.

**Step 2 — Read sprint-feedback.json**

Extract:
- `feedback` — the human's written feedback
- `source_action` — was this triggered by REVISE or REJECT?

**Step 3 — Decide: reform or full_rerun**

Apply this decision logic:

**Choose "reform" if the feedback is about:**
- Specific tasks to add, remove, or swap (e.g. "remove listicles, add blog posts")
- Priority reordering (e.g. "make Core Web Vitals the top priority")
- Tone or positioning of content titles
- Task counts (e.g. "reduce to 3 content pieces")
- One attack vector needs adjustment
- Minor corrections to specific pages or keywords

**Choose "full_rerun" if the feedback is about:**
- The entire strategy being wrong (e.g. "we should focus on technical, not content")
- Wrong target pages — the plan targeted the wrong URLs
- Wrong attack vectors entirely (e.g. "drop off-page, replace with local SEO")
- The plan doesn't match our business goals at all
- `source_action` is "reject" AND the feedback describes systemic problems (not just tweaks)
- Any feedback using words like: "completely wrong", "start over", "rebuild", "not at all",
  "wrong direction", "doesn't make sense", "irrelevant"

**When in doubt:** prefer "reform". Only choose "full_rerun" when the feedback clearly
indicates the plan's foundation is wrong, not just imperfect.

**Step 4 — Identify reform sections (if reform)**

If decision = "reform", identify which sections need changing:
- List the exact section keys: `content_plan`, `technical_plan`, `offpage_plan`,
  `attack_vectors`, `top_opportunity`, `priority_fix`

**Step 5 — Write sprint-feedback-decision.json**

Write `seo-automation/outputs/sprint-feedback-decision.json`:

```json
{
  "decision": "reform",
  "reasoning": "one sentence — why this decision was made",
  "reform_sections": ["content_plan", "technical_plan"],
  "feedback_summary": "one-line plain-English summary of what needs to change"
}
```

Or for full_rerun:

```json
{
  "decision": "full_rerun",
  "reasoning": "one sentence — why the plan needs to be rebuilt from scratch",
  "reform_sections": [],
  "feedback_summary": "one-line plain-English summary of the rejection reason"
}
```

---

## Done Condition

Reply ONLY with: `✅ sprint-feedback-decision.json written (decision: reform|full_rerun)`
