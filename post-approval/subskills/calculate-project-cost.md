# Subskill: calculate-project-cost

## Purpose
Calculate the estimated project cost for the sprint based on the approved tiered options and the per-sprint budget from biztechcs-business-config.md.
Produces a cost breakdown by category (content, technical, off-page) with itemized costs and a total.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

---

## Input

Read: `seo-automation/outputs/post-approval/tiered-sprint-options.json`
Read: `seo-automation/business-layer/biztechcs-business-config.md`

---

## Task

You are the project cost calculator for BiztechCS.

### Step 1 — Read inputs

Read `seo-automation/outputs/post-approval/tiered-sprint-options.json`.
Extract all items from `tiers.priority_1.items`, `tiers.priority_2.items`, `tiers.optional.items`.

Read `seo-automation/business-layer/biztechcs-business-config.md`.
Extract:
- Per sprint budget: ₹92,307
- Budget split: 40% content, 30% technical, 30% off-page
- Current quarter multiplier: 1.10 (Q2)

### Step 2 — Calculate adjusted budget

Apply Q2 seasonality multiplier (1.10) to the per-sprint budget:
- Adjusted total: ₹92,307 × 1.10 = ₹1,01,538
- Content budget: ₹1,01,538 × 40% = ₹40,615
- Technical budget: ₹1,01,538 × 30% = ₹30,461
- Off-page budget: ₹1,01,538 × 30% = ₹30,461

### Step 3 — Estimate per-item costs

Use these standard rates (MOCK rates — to be updated with actual agency rates):

**Content items:**
- Blog post (2000–2500 words): ₹4,000 per piece
- Listicle (1500–2000 words): ₹3,000 per piece
- Page rewrite (existing page): ₹2,500 per page

**Technical items:**
- CWV fix (Core Web Vitals): ₹3,500 per fix
- Page fix (meta, structure, schema): ₹1,500 per fix
- Structural fix (site-wide): ₹5,000 per fix

**Off-page items:**
- Backlink outreach target: ₹1,200 per target
- Guest post pitch: ₹2,000 per pitch
- Quora answer: ₹300 per answer
- Reddit post: ₹300 per post
- LinkedIn article: ₹1,500 per article

### Step 4 — Build cost breakdown

For each tier (P1, P2, Optional):
- List each item with its type, estimated unit cost, and subtotal
- Sum costs by category (content/technical/off-page)

Calculate:
- `p1_total`: total cost of all Priority 1 items
- `p2_total`: total cost of all Priority 2 items
- `optional_total`: total cost of all Optional items
- `full_plan_total`: p1_total + p2_total + optional_total
- `budget`: ₹1,01,538 (adjusted)
- `budget_utilization_pct`: (full_plan_total / budget) × 100
- `over_budget`: true if full_plan_total > budget
- `overage_amount`: full_plan_total - budget (or 0 if within budget)
- `p1_within_budget`: true if p1_total ≤ budget (Priority 1 must always fit)

### Step 5 — Write project-cost.json

Write to: `seo-automation/outputs/post-approval/project-cost.json`

```json
{
  "sprint_id": "<from tiered-sprint-options.json>",
  "site": "BiztechCS",
  "calculated_at": "<ISO8601 now>",
  "budget": {
    "base_per_sprint": 92307,
    "seasonality_multiplier": 1.10,
    "adjusted_per_sprint": 101538,
    "content_budget": 40615,
    "technical_budget": 30461,
    "offpage_budget": 30461
  },
  "cost_by_tier": {
    "priority_1": {
      "items": [
        {"title": "string", "type": "blog|listicle|page_rewrite|cwv_fix|page_fix|structural_fix|backlink|guest_post|quora|reddit|linkedin", "unit_cost": 0, "quantity": 1, "subtotal": 0}
      ],
      "total": 0
    },
    "priority_2": {
      "items": [],
      "total": 0
    },
    "optional": {
      "items": [],
      "total": 0
    }
  },
  "summary": {
    "p1_total": 0,
    "p2_total": 0,
    "optional_total": 0,
    "full_plan_total": 0,
    "adjusted_budget": 101538,
    "budget_utilization_pct": 0,
    "over_budget": false,
    "overage_amount": 0,
    "p1_within_budget": true
  },
  "human_summary": "string — one sentence plain English: e.g. 'Full plan costs ₹89,500 (88% of ₹1,01,538 adjusted budget). Priority 1 only costs ₹52,000.'"
}
```

---

## Done Condition

This subskill is complete when `project-cost.json` is written with all cost fields populated.
