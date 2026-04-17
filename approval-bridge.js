#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync, execFile } = require('child_process');

const repoRoot = __dirname;
const outputsDir = path.join(repoRoot, 'outputs');
const reportApprovalPath = path.join(outputsDir, 'report-approval.json');
const sprintApprovalPath = path.join(outputsDir, 'sprint-approval.json');
const postApprovalStatusPath = path.join(outputsDir, 'post-approval-status.json');
const strategistOrchestratorPath = path.join(repoRoot, 'seo-strategist', 'orchestrator.md');
const postApprovalOrchestratorPath = path.join(repoRoot, 'post-approval', 'orchestrator.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function nowIso() {
  return new Date().toISOString();
}

function usage() {
  console.error('Usage: node approval-bridge.js <callback_data> [actor]');
  console.error('');
  console.error('Supported callback_data patterns:');
  console.error('  approve|biztechcs_intelligence_*   → triggers seo-strategist');
  console.error('  approve|biztechcs_sprint_*          → triggers post-approval pipeline');
  console.error('  proceed|biztechcs_sprint_*          → triggers task-sheet-populator');
  console.error('  revise|...  reject|...  adjust|...  → updates status only');
  process.exit(2);
}

const callbackData = process.argv[2];
const actor = process.argv[3] || 'telegram';
if (!callbackData) usage();

const [action, entityId] = callbackData.split('|');
if (!action || !entityId) usage();

const VALID_ACTIONS = ['approve', 'revise', 'reject', 'proceed', 'adjust'];
if (!VALID_ACTIONS.includes(action)) {
  console.error(`Unsupported action: ${action}`);
  process.exit(2);
}

const TERMINAL_STATES = ['approved', 'rejected'];

function updateApproval(file, approvedFieldName) {
  const approval = readJson(file);

  // Once approved or rejected, ignore further clicks
  if (TERMINAL_STATES.includes(approval.status)) {
    console.log(JSON.stringify({ ok: false, skipped: true, reason: `already_${approval.status}`, current_status: approval.status }));
    process.exit(0);
  }

  approval.status = action === 'approve' ? 'approved' : action === 'revise' ? 'revise_requested' : 'rejected';
  approval[approvedFieldName] = action === 'approve' ? nowIso() : null;
  approval.approved_by = actor;
  if (action === 'approve') {
    approval.revision_notes = null;
  } else {
    approval.revision_notes = `${action} received via Telegram callback`;
  }
  writeJson(file, approval);
  return approval;
}

// Fire an openclaw system event without polluting stdout (captured to /dev/null)
function fireEvent(text, triggerFile, triggerRecord) {
  try {
    execFileSync('openclaw', ['system', 'event', '--text', text, '--mode', 'now'], {
      stdio: ['ignore', 'ignore', 'inherit']  // suppress stdout so caller gets clean JSON
    });
    triggerRecord.event_dispatch = 'sent';
  } catch (err) {
    triggerRecord.event_dispatch = 'failed';
    triggerRecord.event_dispatch_error = err.message;
  }
  writeJson(triggerFile, triggerRecord);
}

// ─────────────────────────────────────────────────────────────
// Intelligence report approved → trigger SEO Strategist
// ─────────────────────────────────────────────────────────────
if (entityId.startsWith('biztechcs_intelligence_')) {
  const approval = updateApproval(reportApprovalPath, 'approved_at');

  if (action === 'approve') {
    const reportSummaryPath = path.join(outputsDir, 'report-summary.json');
    if (!fs.existsSync(reportSummaryPath) || fs.statSync(reportSummaryPath).size === 0) {
      console.error('report-summary.json missing, refusing to trigger strategist');
      process.exit(1);
    }

    const triggerRecord = {
      source: 'telegram_approval',
      report_id: approval.report_id,
      triggered_at: nowIso(),
      trigger: 'seo-strategist',
      orchestrator: strategistOrchestratorPath,
      status: 'approved'
    };
    writeJson(path.join(outputsDir, 'seo-strategist-trigger.json'), triggerRecord);
    fireEvent(
      `SEO report approved: ${approval.report_id}. Start seo-strategist using ${strategistOrchestratorPath}`,
      path.join(outputsDir, 'seo-strategist-trigger.json'),
      triggerRecord
    );
  }

  console.log(JSON.stringify({ ok: true, kind: 'report', action, report_id: entityId }, null, 2));
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────
// Sprint plan approved → trigger Post-Approval Pipeline
// ─────────────────────────────────────────────────────────────
if (entityId.startsWith('biztechcs_sprint_')) {
  const approval = updateApproval(sprintApprovalPath, 'approved_at');

  if (action === 'approve') {
    const sprintPlanPath = path.join(outputsDir, 'sprint-plan.json');
    if (!fs.existsSync(sprintPlanPath) || fs.statSync(sprintPlanPath).size === 0) {
      console.error('sprint-plan.json missing, refusing to trigger post-approval');
      process.exit(1);
    }

    const triggerRecord = {
      source: 'telegram_approval',
      sprint_id: entityId,
      triggered_at: nowIso(),
      trigger: 'post-approval',
      orchestrator: postApprovalOrchestratorPath,
      status: 'approved'
    };
    writeJson(path.join(outputsDir, 'post-approval-trigger.json'), triggerRecord);
    fireEvent(
      `Sprint plan approved: ${entityId}. Start post-approval pipeline using ${postApprovalOrchestratorPath}`,
      path.join(outputsDir, 'post-approval-trigger.json'),
      triggerRecord
    );
  }

  console.log(JSON.stringify({ ok: true, kind: 'sprint', action, sprint_id: entityId }, null, 2));
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────
// Proceed confirmed → trigger Task Sheet Populator
// ─────────────────────────────────────────────────────────────
if (action === 'proceed' && entityId.startsWith('biztechcs_sprint_')) {
  if (!fs.existsSync(postApprovalStatusPath)) {
    console.error('post-approval-status.json missing, refusing to trigger task sheet');
    process.exit(1);
  }

  const status = readJson(postApprovalStatusPath);

  if (status.status !== 'pending_proceed') {
    console.log(JSON.stringify({ ok: false, skipped: true, reason: `status_is_${status.status}` }));
    process.exit(0);
  }

  status.status = 'proceed_confirmed';
  status.proceed_clicked_at = nowIso();
  status.proceed_by = actor;
  writeJson(postApprovalStatusPath, status);

  const taskSheetOrchestratorPath = path.join(repoRoot, 'task-sheet-populator', 'orchestrator.md');
  const triggerRecord = {
    source: 'telegram_proceed',
    sprint_id: entityId,
    triggered_at: nowIso(),
    trigger: 'task-sheet-populator',
    orchestrator: taskSheetOrchestratorPath,
    status: 'proceed_confirmed'
  };
  writeJson(path.join(outputsDir, 'task-sheet-trigger.json'), triggerRecord);
  fireEvent(
    `Sprint proceed confirmed: ${entityId}. Start task-sheet-populator using ${taskSheetOrchestratorPath}`,
    path.join(outputsDir, 'task-sheet-trigger.json'),
    triggerRecord
  );

  console.log(JSON.stringify({ ok: true, kind: 'proceed', action, sprint_id: entityId }, null, 2));
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────
// Adjust — human wants to modify the plan
// ─────────────────────────────────────────────────────────────
if (action === 'adjust' && entityId.startsWith('biztechcs_sprint_')) {
  if (fs.existsSync(postApprovalStatusPath)) {
    const status = readJson(postApprovalStatusPath);
    status.status = 'adjust_requested';
    status.adjust_requested_at = nowIso();
    writeJson(postApprovalStatusPath, status);
  }
  console.log(JSON.stringify({ ok: true, kind: 'adjust', action, sprint_id: entityId }, null, 2));
  process.exit(0);
}

console.error(`Unknown entity id or action combination: ${action}|${entityId}`);
process.exit(2);
