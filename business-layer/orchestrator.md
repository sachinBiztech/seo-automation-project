# Business Validation Agent

## Purpose
Validates the Product Owner-approved sprint plan against annual business goals, sprint quotas, budget allocation, and MQL/SQL targets. Builds tiered task options (P1/P2/Optional) for human POC selection.

## Model
claude-opus-4-6

## Mode
MOCK

## Input
- seo-automation/outputs/post-approval/product-owner-review.json
- seo-automation/outputs/post-approval/enriched-sprint-plan.json
- seo-automation/business-layer/biztechcs-business-config.md

## Task

Only proceed if `product-owner-review.json.verdict` is `approved`. If not approved, STOP and log.

### Run sequence

#### Step 1 — Check Quota Compliance
Run subskill: `check-quota-compliance`
Expected output: `seo-automation/outputs/post-approval/quota-check.json`
Failure action: STOP. Quota violations must be resolved before proceeding.

#### Step 2 — Check Goal Alignment
Run subskill: `check-goal-alignment`
Expected output: `seo-automation/outputs/post-approval/goal-alignment.json`
Failure action: WARNING. Note misalignment but continue.

#### Step 3 — Check MQL/SQL Performance
Run subskill: `check-mql-sql-performance`
Expected output: `seo-automation/outputs/post-approval/mql-check.json`
Failure action: WARNING. Performance context is informational, not blocking.

#### Step 4 — Check Topic Territory (BiztechCS only)
Run subskill: `check-topic-territory`
Expected output: `seo-automation/outputs/post-approval/topic-territory-check.json`
Failure action: STOP. Out-of-territory topics must be removed before presenting to POC.

#### Step 5 — Build Tiered Options
Run subskill: `build-tiered-options`
Expected output: `seo-automation/outputs/post-approval/tiered-sprint-options.json`
Failure action: STOP. Send Telegram: "❌ Business Layer failed to build tiered options for [sprint_id]."

### After Step 5 — Send to Human POC
Send Telegram message to POC (format per plan.md Phase 3.3):
```
📋 SPRINT STRATEGY — [sprint_start] to [sprint_end]

ATTACK VECTOR 1: [brief]
ATTACK VECTOR 2: [brief]
ATTACK VECTOR 3: [brief]

PRIORITY 1 TASKS: [list]
PRIORITY 2 TASKS: [list]
OPTIONAL TASKS: [list]

MQL/SQL vs target (last sprint): [from mql-check.json]
Budget allocation: [per-sprint amount] | Remaining annual: [amount]

📄 Full strategy: [PDF path]

Pick tasks, adjust priorities if needed, then reply GO.
```

## Output
- `seo-automation/outputs/post-approval/tiered-sprint-options.json`
- `seo-automation/outputs/post-approval/business-validation.json`
