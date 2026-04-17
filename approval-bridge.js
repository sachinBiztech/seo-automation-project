#!/usr/bin/env node
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { execFileSync } = require('child_process');

const repoRoot              = __dirname;
const outputsDir            = path.join(repoRoot, 'outputs');
const reportApprovalPath    = path.join(outputsDir, 'report-approval.json');
const sprintApprovalPath    = path.join(outputsDir, 'sprint-approval.json');
const postApprovalStatusPath = path.join(outputsDir, 'post-approval-status.json');
const pendingTextReplyPath  = path.join(outputsDir, 'pending-text-reply.json');
const sprintFeedbackPath    = path.join(outputsDir, 'sprint-feedback.json');

const strategistOrchestratorPath     = path.join(repoRoot, 'seo-strategist', 'orchestrator.md');
const postApprovalOrchestratorPath   = path.join(repoRoot, 'post-approval', 'orchestrator.md');
const reviewFeedbackOrchestratorPath = path.join(repoRoot, 'review-sprint-feedback', 'orchestrator.md');

const TELEGRAM_CHAT_ID = '-1003829892114';
const TERMINAL_STATES  = ['approved', 'scrapped'];

// ── Helpers ────────────────────────────────────────────────────────────────────

function readJson(file)       { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, data){ fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n'); }
function nowIso()             { return new Date().toISOString(); }

function getBotToken() {
  const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.openclaw', 'openclaw.json'), 'utf8'));
  const tok = cfg?.channels?.telegram?.botToken;
  if (!tok) throw new Error('Telegram botToken not found in ~/.openclaw/openclaw.json');
  return tok;
}

// Sends a regular Telegram message (for status updates)
function sendTelegram(text) {
  try {
    execFileSync('openclaw', [
      'message', 'send', '--channel', 'telegram',
      '--target', TELEGRAM_CHAT_ID, '--message', text
    ], { stdio: ['ignore', 'ignore', 'inherit'], timeout: 15000 });
    return true;
  } catch (_) { return false; }
}

// Sends a force_reply message — Telegram pins a reply bar to this message in the user's UI
// Returns the message_id so callback-listener can validate replies are actually to this message
function sendTelegramForceReply(text) {
  const token = getBotToken();
  const body = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text,
    reply_markup: { force_reply: true, selective: false }
  });
  try {
    const out = execFileSync('curl', [
      '-s', '-X', 'POST',
      `https://api.telegram.org/bot${token}/sendMessage`,
      '-H', 'Content-Type: application/json',
      '-d', body
    ], { encoding: 'utf8', timeout: 10000 });
    const result = JSON.parse(out);
    return result.result?.message_id || null;
  } catch (_) { return null; }
}

// Fires an openclaw system event to trigger an agent
function fireEvent(text, triggerFile, triggerRecord) {
  try {
    execFileSync('openclaw', ['system', 'event', '--text', text, '--mode', 'now'], {
      stdio: ['ignore', 'ignore', 'inherit']
    });
    triggerRecord.event_dispatch = 'sent';
  } catch (err) {
    triggerRecord.event_dispatch = 'failed';
    triggerRecord.event_dispatch_error = err.message;
  }
  writeJson(triggerFile, triggerRecord);
}

// ── Arg parsing ────────────────────────────────────────────────────────────────

function usage() {
  console.error('Usage: node approval-bridge.js <callback_data> [actor] [text]');
  console.error('');
  console.error('callback_data patterns:');
  console.error('  approve|biztechcs_intelligence_*   → triggers seo-strategist');
  console.error('  approve|biztechcs_sprint_*          → triggers post-approval pipeline');
  console.error('  revise|biztechcs_sprint_*           → collects feedback via force_reply');
  console.error('  reject|biztechcs_sprint_*           → collects feedback via force_reply');
  console.error('  sprint-feedback|biztechcs_sprint_*  → sends feedback to agent, triggers review');
  console.error('  proceed|biztechcs_sprint_*          → triggers task-sheet-populator');
  console.error('  adjust|biztechcs_sprint_*           → marks adjust_requested');
  process.exit(2);
}

const callbackData = process.argv[2];
const actor        = process.argv[3] || 'telegram';
const textArg      = process.argv[4] || '';
if (!callbackData) usage();

const [action, entityId] = callbackData.split('|');
if (!action || !entityId) usage();

const VALID_ACTIONS = ['approve', 'revise', 'reject', 'sprint-feedback', 'proceed', 'adjust'];
if (!VALID_ACTIONS.includes(action)) {
  console.error(`Unsupported action: ${action}`);
  process.exit(2);
}

// ─────────────────────────────────────────────────────────────
// Intelligence report → trigger SEO Strategist
// ─────────────────────────────────────────────────────────────
if (entityId.startsWith('biztechcs_intelligence_')) {
  const approval = JSON.parse(fs.readFileSync(reportApprovalPath, 'utf8'));
  if (TERMINAL_STATES.includes(approval.status)) {
    console.log(JSON.stringify({ ok: false, skipped: true, reason: `already_${approval.status}` }));
    process.exit(0);
  }
  approval.status       = action === 'approve' ? 'approved' : action === 'revise' ? 'revise_requested' : 'rejected';
  approval.approved_at  = action === 'approve' ? nowIso() : null;
  approval.approved_by  = actor;
  approval.revision_notes = action === 'approve' ? null : `${action} via Telegram`;
  writeJson(reportApprovalPath, approval);

  if (action === 'approve') {
    const reportSummaryPath = path.join(outputsDir, 'report-summary.json');
    if (!fs.existsSync(reportSummaryPath) || fs.statSync(reportSummaryPath).size === 0) {
      console.error('report-summary.json missing, refusing to trigger strategist');
      process.exit(1);
    }
    const triggerRecord = {
      source: 'telegram_approval', report_id: approval.report_id,
      triggered_at: nowIso(), trigger: 'seo-strategist',
      orchestrator: strategistOrchestratorPath, status: 'approved'
    };
    writeJson(path.join(outputsDir, 'seo-strategist-trigger.json'), triggerRecord);
    fireEvent(
      `SEO report approved: ${approval.report_id}. Start seo-strategist using ${strategistOrchestratorPath}`,
      path.join(outputsDir, 'seo-strategist-trigger.json'), triggerRecord
    );
  }

  console.log(JSON.stringify({ ok: true, kind: 'report', action, report_id: entityId }, null, 2));
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────
// Sprint plan: approve
// ─────────────────────────────────────────────────────────────
if (action === 'approve' && entityId.startsWith('biztechcs_sprint_')) {
  if (!fs.existsSync(sprintApprovalPath)) {
    console.error('sprint-approval.json missing'); process.exit(1);
  }
  const sprintApproval = readJson(sprintApprovalPath);
  if (TERMINAL_STATES.includes(sprintApproval.status)) {
    console.log(JSON.stringify({ ok: false, skipped: true, reason: `already_${sprintApproval.status}` }));
    process.exit(0);
  }

  sprintApproval.status      = 'approved';
  sprintApproval.approved_at = nowIso();
  sprintApproval.approved_by = actor;
  writeJson(sprintApprovalPath, sprintApproval);

  const sprintPlanPath = path.join(outputsDir, 'sprint-plan.json');
  if (!fs.existsSync(sprintPlanPath) || fs.statSync(sprintPlanPath).size === 0) {
    console.error('sprint-plan.json missing, refusing to trigger post-approval'); process.exit(1);
  }

  const triggerRecord = {
    source: 'telegram_approval', sprint_id: entityId,
    triggered_at: nowIso(), trigger: 'post-approval',
    orchestrator: postApprovalOrchestratorPath, status: 'approved'
  };
  writeJson(path.join(outputsDir, 'post-approval-trigger.json'), triggerRecord);
  fireEvent(
    `Sprint plan approved: ${entityId}. Start post-approval pipeline using ${postApprovalOrchestratorPath}`,
    path.join(outputsDir, 'post-approval-trigger.json'), triggerRecord
  );

  console.log(JSON.stringify({ ok: true, kind: 'sprint', action, sprint_id: entityId }, null, 2));
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────
// Sprint plan: revise OR reject — both collect feedback first
// The agent decides what to do with the feedback (reform vs full re-run)
// ─────────────────────────────────────────────────────────────
if ((action === 'revise' || action === 'reject') && entityId.startsWith('biztechcs_sprint_')) {
  if (!fs.existsSync(sprintApprovalPath)) {
    console.error('sprint-approval.json missing'); process.exit(1);
  }
  const sprintApproval = readJson(sprintApprovalPath);
  if (TERMINAL_STATES.includes(sprintApproval.status)) {
    console.log(JSON.stringify({ ok: false, skipped: true, reason: `already_${sprintApproval.status}` }));
    process.exit(0);
  }

  sprintApproval.status = 'pending_feedback';
  sprintApproval.feedback_requested_at = nowIso();
  sprintApproval.feedback_source_action = action;
  writeJson(sprintApprovalPath, sprintApproval);

  const promptText = action === 'revise'
    ? `✏️ What needs to change in the sprint plan?\n\nDescribe clearly — the AI will decide whether to fix specific sections or rebuild the full plan from scratch.`
    : `❌ Sprint plan rejected. What's wrong with it?\n\nDescribe the issues — the AI will decide whether to fix specific sections or rebuild the full plan from scratch.`;

  const messageId = sendTelegramForceReply(promptText);

  writeJson(pendingTextReplyPath, {
    action: 'sprint-feedback',
    sprint_id: entityId,
    source_action: action,
    force_reply_message_id: messageId,
    created_at: nowIso()
  });

  console.log(JSON.stringify({ ok: true, kind: 'sprint', action, sprint_id: entityId, awaiting_feedback: true }));
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────
// sprint-feedback: user replied with their notes
// Write sprint-feedback.json and trigger review-sprint-feedback agent
// ─────────────────────────────────────────────────────────────
if (action === 'sprint-feedback' && entityId.startsWith('biztechcs_sprint_')) {
  if (!textArg) {
    console.error('No feedback text provided'); process.exit(1);
  }

  let sourceAction = 'unknown';
  if (fs.existsSync(pendingTextReplyPath)) {
    sourceAction = readJson(pendingTextReplyPath).source_action || 'unknown';
    fs.unlinkSync(pendingTextReplyPath);
  }

  writeJson(sprintFeedbackPath, {
    sprint_id: entityId,
    source_action: sourceAction,
    feedback: textArg,
    received_at: nowIso()
  });

  // Mark sprint-approval.json as feedback received
  if (fs.existsSync(sprintApprovalPath)) {
    const sprintApproval = readJson(sprintApprovalPath);
    sprintApproval.status = 'feedback_received';
    sprintApproval.feedback_received_at = nowIso();
    writeJson(sprintApprovalPath, sprintApproval);
  }

  sendTelegram(`🤖 Feedback received. Analyzing and deciding next steps for Sprint ${entityId}...`);

  const triggerRecord = {
    source: 'telegram_feedback',
    sprint_id: entityId,
    triggered_at: nowIso(),
    trigger: 'review-sprint-feedback',
    orchestrator: reviewFeedbackOrchestratorPath
  };
  writeJson(path.join(outputsDir, 'review-sprint-trigger.json'), triggerRecord);
  fireEvent(
    `Sprint feedback received: ${entityId}. Start review-sprint-feedback using ${reviewFeedbackOrchestratorPath}`,
    path.join(outputsDir, 'review-sprint-trigger.json'), triggerRecord
  );

  console.log(JSON.stringify({ ok: true, kind: 'sprint', action: 'sprint-feedback', sprint_id: entityId }));
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────
// Proceed confirmed → trigger Task Sheet Populator
// ─────────────────────────────────────────────────────────────
if (action === 'proceed' && entityId.startsWith('biztechcs_sprint_')) {
  if (!fs.existsSync(postApprovalStatusPath)) {
    console.error('post-approval-status.json missing'); process.exit(1);
  }
  const status = readJson(postApprovalStatusPath);
  if (status.status !== 'pending_proceed') {
    console.log(JSON.stringify({ ok: false, skipped: true, reason: `status_is_${status.status}` }));
    process.exit(0);
  }
  status.status           = 'proceed_confirmed';
  status.proceed_clicked_at = nowIso();
  status.proceed_by       = actor;
  writeJson(postApprovalStatusPath, status);

  const taskSheetOrchestratorPath = path.join(repoRoot, 'task-sheet-populator', 'orchestrator.md');
  const triggerRecord = {
    source: 'telegram_proceed', sprint_id: entityId,
    triggered_at: nowIso(), trigger: 'task-sheet-populator',
    orchestrator: taskSheetOrchestratorPath, status: 'proceed_confirmed'
  };
  writeJson(path.join(outputsDir, 'task-sheet-trigger.json'), triggerRecord);
  fireEvent(
    `Sprint proceed confirmed: ${entityId}. Start task-sheet-populator using ${taskSheetOrchestratorPath}`,
    path.join(outputsDir, 'task-sheet-trigger.json'), triggerRecord
  );

  console.log(JSON.stringify({ ok: true, kind: 'proceed', action, sprint_id: entityId }, null, 2));
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────
// Adjust
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
