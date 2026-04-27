# Subskill: enrich-sprint-plan

## Purpose
Inject Sections 9 (Expert Intelligence Applied) and 10 (History-Backed Rationale)
into sprint-plan.html before PDF generation. The Concept requires these sections
in every sprint plan — no exceptions. They are produced by Steps 4e and 4f
after sprint-plan.html is assembled, so this step merges them in.

## Model
claude-haiku-4-5-20251001

## Mode
MOCK

---

## Input

Read all three of these files:

1. `seo-automation/outputs/seo-strategist/sprint-plan.html`
2. `seo-automation/outputs/seo-strategist/expert-intelligence-map.json`
3. `seo-automation/outputs/seo-strategist/history-rationale.json`

---

## Task

You are enriching the sprint plan HTML with two mandatory sections.

### Step 1 — Read inputs

Read `sprint-plan.html`. Find the closing `</body>` tag — you will insert new HTML
immediately before it.

Read `expert-intelligence-map.json`. Extract `mappings` array.

Read `history-rationale.json`. Extract `validated_tactics`, `failed_tactics`,
`sprint_warnings`, and `baseline_run` flag.

### Step 2 — Build Section 9 HTML (Expert Intelligence Applied)

Build an HTML section using the mappings from expert-intelligence-map.json.

```html
<div class="section">
  <h2>Section 9 — Expert Intelligence Applied</h2>
  <p style="color:#718096;font-size:12px;margin-bottom:16px;">
    Every major tactic below is traceable to a specific research finding (Q1–Q20)
    and a named expert source. Generic strategies have been rejected.
  </p>
  <table style="width:100%;border-collapse:collapse;font-size:12px;">
    <thead>
      <tr style="background:#2d3748;color:#fff;">
        <th style="padding:8px 12px;text-align:left;">Sprint Decision</th>
        <th style="padding:8px 12px;text-align:left;">Research Q</th>
        <th style="padding:8px 12px;text-align:left;">Expert / Source</th>
        <th style="padding:8px 12px;text-align:left;">Finding Applied</th>
      </tr>
    </thead>
    <tbody>
      <!-- One row per mapping from expert-intelligence-map.json mappings array -->
      <!-- tr style alternating: background #f7fafc and #fff -->
      <!-- td style padding:8px 12px -->
      <!-- If source_type is "llm_knowledge", add note "(Model knowledge — verify for production)" -->
    </tbody>
  </table>
</div>
```

Populate the table with all entries from the `mappings` array. Each entry has:
- `tactic` → Sprint Decision column
- `q_number` → Research Q column
- `expert_source` → Expert / Source column
- `finding_applied` → Finding Applied column

If `mappings` is empty or missing, render: `<p>Expert intelligence map not yet available for this sprint cycle.</p>`

### Step 3 — Build Section 10 HTML (History-Backed Rationale)

Build an HTML section using history-rationale.json.

If `baseline_run` is true:
```html
<div class="section">
  <h2>Section 10 — History-Backed Rationale</h2>
  <p style="color:#718096;font-size:13px;">
    Sprint 1 — Baseline run. No prior sprint history available.
    All tactics are first-cycle baseline. Results will seed Sprint 2 rationale.
  </p>
</div>
```

If `baseline_run` is false (prior history exists), render a full table:
```html
<div class="section">
  <h2>Section 10 — History-Backed Rationale</h2>
  <p style="color:#718096;font-size:12px;margin-bottom:16px;">
    Tactics repeated from prior sprints are marked with their outcome.
    Failed tactics from prior sprints are flagged — do not repeat without a new angle.
  </p>
  <table style="width:100%;border-collapse:collapse;font-size:12px;">
    <thead>
      <tr style="background:#2d3748;color:#fff;">
        <th style="padding:8px 12px;text-align:left;">Previous Sprint</th>
        <th style="padding:8px 12px;text-align:left;">Tactic</th>
        <th style="padding:8px 12px;text-align:left;">Outcome</th>
        <th style="padding:8px 12px;text-align:left;">Applied This Sprint?</th>
        <th style="padding:8px 12px;text-align:left;">Reason</th>
      </tr>
    </thead>
    <tbody>
      <!-- Rows from validated_tactics with green left border (#48bb78) -->
      <!-- Rows from failed_tactics with red left border (#fc8181) -->
      <!-- sprint_warnings rendered as orange rows (#ed8936) -->
    </tbody>
  </table>
</div>
```

Populate from `validated_tactics`, `failed_tactics`, and `sprint_warnings` arrays.

### Step 4 — Inject and overwrite

Construct the full updated HTML:
- Take the original `sprint-plan.html` content exactly as read
- Find the closing `</body>` tag
- Insert the Section 9 HTML block immediately before `</body>`
- Insert the Section 10 HTML block immediately after Section 9, still before `</body>`
- Write the complete updated HTML back to `seo-automation/outputs/seo-strategist/sprint-plan.html`

---

## Output

Overwrite `seo-automation/outputs/seo-strategist/sprint-plan.html` with the enriched version.

Reply ONLY with: ✅ sprint-plan.html enriched with Sections 9 and 10
