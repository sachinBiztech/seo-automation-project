#!/usr/bin/env node
/**
 * content-approval-bridge.js
 *
 * Watches OpenClaw session JSONL files for content approval callbacks from Telegram.
 * Handles: content_approve | content_revise | content_reject
 *
 * Callback data format (set by run-content-pipeline.js):
 *   content_approve|biztechcs_sprint_2026-04-14|odoo-implementation-partner-india
 *   content_revise|biztechcs_sprint_2026-04-14|odoo-implementation-partner-india
 *   content_reject|biztechcs_sprint_2026-04-14|odoo-implementation-partner-india
 *
 * Usage:
 *   node content-approval-bridge.js &
 *   node content-approval-bridge.js --once    (run check once and exit)
 */

'use strict';

const fs            = require('fs');
const path          = require('path');
const os            = require('os');
const { spawnSync } = require('child_process');

// ── Config ────────────────────────────────────────────────────────────────────

const SESSIONS_DIR    = path.join(os.homedir(), '.openclaw', 'agents');
const SEO_DIR         = '/home/sachin.p/.openclaw/workspace/seo-automation';
const OUTPUTS_DIR     = path.join(SEO_DIR, 'outputs');
const LOGS_DIR        = path.join(OUTPUTS_DIR, 'logs');
const CONTENT_OUT     = path.join(OUTPUTS_DIR, 'content-pipeline');
const SPRINT_PM_OUT   = path.join(OUTPUTS_DIR, 'sprint-pm');
const LOG_FILE        = path.join(LOGS_DIR, 'content-approval-bridge.log');
const STATE_FILE      = path.join(LOGS_DIR, 'content-approval-bridge-state.json');
const TELEGRAM_ID     = '-1003829892114';
const POLL_INTERVAL   = 3000; // ms
const ONCE_MODE       = process.argv.includes('--once');
const CALLBACK_ARG    = (() => { const i = process.argv.indexOf('--callback'); return i !== -1 ? process.argv[i + 1] : null; })();

// ── Logging ───────────────────────────────────────────────────────────────────

function log(level, msg) {
  const line = `[${new Date().toISOString()}] [${level}] ${msg}`;
  console.log(line);
  if (!ONCE_MODE) {
    try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch (_) {}
  }
}

// ── State: track last-seen position per JSONL file ────────────────────────────

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (_) { return { offsets: {}, processed: [] }; }
}

function saveState(state) {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8'); } catch (_) {}
}

// ── Find all session JSONL files ──────────────────────────────────────────────

function findSessionFiles() {
  const files = [];
  try {
    const agents = fs.readdirSync(SESSIONS_DIR);
    for (const agent of agents) {
      const sessDir = path.join(SESSIONS_DIR, agent, 'sessions');
      if (!fs.existsSync(sessDir)) continue;
      for (const f of fs.readdirSync(sessDir)) {
        if (f.endsWith('.jsonl')) files.push(path.join(sessDir, f));
      }
    }
  } catch (_) {}
  return files;
}

// ── Scan JSONL for new content callback lines ─────────────────────────────────

function scanFile(filePath, offset) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size <= offset) return { callbacks: [], newOffset: offset };

    const content = fs.readFileSync(filePath, 'utf8').slice(offset);
    const newOffset = stat.size;
    const callbacks = [];

    for (const line of content.split('\n')) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        const cbData = extractCallbackData(obj);
        if (cbData && cbData.startsWith('content_')) callbacks.push(cbData);
      } catch (_) {}
    }

    return { callbacks, newOffset };
  } catch (_) {
    return { callbacks: [], newOffset: offset };
  }
}

function extractCallbackData(obj) {
  // OpenClaw JSONL stores callback_query data in various shapes
  const str = JSON.stringify(obj);
  const match = str.match(/callback_data["\s:]+([^"\\]+)/);
  return match ? match[1].trim() : null;
}

// ── Telegram ──────────────────────────────────────────────────────────────────

function telegramSend(message) {
  const r = spawnSync(
    'openclaw',
    ['message', 'send', '--channel', 'telegram', '--target', TELEGRAM_ID, '--message', message],
    { encoding: 'utf8', timeout: 30000 }
  );
  if (r.status !== 0) log('WARN', `Telegram send failed: ${r.stderr || r.stdout}`);
}

// ── Update content approval JSON ──────────────────────────────────────────────

function updateApproval(sprintId, slug, action, notes = null) {
  const approvalFile = path.join(CONTENT_OUT, `content-approval-${sprintId}.json`);
  if (!fs.existsSync(approvalFile)) {
    log('WARN', `Approval file not found: ${approvalFile}`);
    return null;
  }
  const data = JSON.parse(fs.readFileSync(approvalFile, 'utf8'));
  const item = data.items.find(i => i.slug === slug);
  if (!item) {
    log('WARN', `Slug ${slug} not found in ${approvalFile}`);
    return null;
  }

  if (action === 'content_approve') {
    item.status      = 'approved';
    item.approved_at = new Date().toISOString();
    item.approved_by = 'telegram';
  } else if (action === 'content_reject') {
    item.status      = 'rejected';
    item.rejected_at = new Date().toISOString();
  } else if (action === 'content_revise') {
    item.status         = 'revision_requested';
    item.revision_notes = notes;
    item.revised_at     = new Date().toISOString();
  }

  fs.writeFileSync(approvalFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return item;
}

// ── Update sprint task status ─────────────────────────────────────────────────

function updateTaskStatus(sprintId, taskId, status) {
  if (!taskId) return;
  const tasksFile = path.join(SPRINT_PM_OUT, `sprint-tasks-${sprintId}.json`);
  if (!fs.existsSync(tasksFile)) return;
  let data;
  try { data = JSON.parse(fs.readFileSync(tasksFile, 'utf8')); } catch (_) { return; }
  if (!Array.isArray(data.tasks)) {
    log('ERROR', `sprint-tasks-${sprintId}.json has wrong format (missing tasks array) — skipping status update`);
    return;
  }
  const task = data.tasks.find(t => t.sr === taskId);
  if (!task) return;
  task.status = status;
  if (status === 'Done') task.completed = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(tasksFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
  log('INFO', `Task ${taskId} status → ${status}`);
}

// ── Handle callback ───────────────────────────────────────────────────────────

function findApprovalByTaskId(taskId) {
  const files = fs.readdirSync(CONTENT_OUT).filter(f => f.startsWith('content-approval-') && f.endsWith('.json'));
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(CONTENT_OUT, f), 'utf8'));
      const item = data.items.find(i => String(i.task_id) === String(taskId));
      if (item) return { sprintId: data.sprint_id, slug: item.slug };
    } catch (_) {}
  }
  return null;
}

function handleCallback(callbackData, state) {
  if (state.processed.includes(callbackData)) return; // already handled

  const parts = callbackData.split('|');
  if (parts.length < 2) return;

  let action, sprintId, slug;
  if (parts.length === 2) {
    action = parts[0];
    const found = findApprovalByTaskId(parts[1]);
    if (!found) { log('WARN', `No approval record found for task_id=${parts[1]}`); return; }
    sprintId = found.sprintId;
    slug = found.slug;
  } else {
    [action, sprintId, slug] = parts;
  }
  log('INFO', `Callback: ${action} | sprint=${sprintId} | slug=${slug}`);

  state.processed.push(callbackData);
  saveState(state);

  const item = updateApproval(sprintId, slug, action);
  if (!item) return;

  if (action === 'content_approve') {
    log('INFO', `APPROVED: ${slug} — triggering publishing agent`);
    telegramSend(`✅ Approved. Publishing "${item.title}" now...`);
    updateTaskStatus(sprintId, item.task_id, 'Publishing');

    // Trigger Publishing Agent
    const result = spawnSync(
      'node',
      [path.join(SEO_DIR, 'run-publishing-agent.js'), '--sprint-id', sprintId, '--slug', slug],
      { encoding: 'utf8', timeout: 120000, stdio: 'inherit' }
    );

    if (result.status !== 0) {
      log('ERROR', `Publishing agent failed for ${slug}`);
      telegramSend(`❌ Publishing failed for "${item.title}". Manual action required.`);
      updateTaskStatus(sprintId, item.task_id, 'Publish Failed');
    }

  } else if (action === 'content_reject') {
    log('INFO', `REJECTED: ${slug}`);
    telegramSend(`❌ Rejected: "${item.title}". Task marked as rejected in sprint sheet.`);
    updateTaskStatus(sprintId, item.task_id, 'Rejected');

  } else if (action === 'content_revise') {
    log('INFO', `REVISION REQUESTED: ${slug}`);
    telegramSend(`🔄 Revision requested for "${item.title}". Re-running content pipeline from editor step...`);
    updateTaskStatus(sprintId, item.task_id, 'Revising');

    // Re-run pipeline from editor step
    const result = spawnSync(
      'node',
      [
        path.join(SEO_DIR, 'run-content-pipeline.js'),
        '--sprint-id', sprintId,
        '--task-id',   String(item.task_id),
        '--slug',      slug,
        '--from',      'editor',
      ],
      { encoding: 'utf8', timeout: 600000, stdio: 'inherit' }
    );

    if (result.status !== 0) {
      log('ERROR', `Revision pipeline failed for ${slug}`);
      telegramSend(`❌ Revision pipeline failed for "${item.title}". Manual action required.`);
    }
  }
}

// ── Poll loop ─────────────────────────────────────────────────────────────────

function poll() {
  const state = loadState();

  const files = findSessionFiles();
  for (const filePath of files) {
    const offset = state.offsets[filePath] || 0;
    const { callbacks, newOffset } = scanFile(filePath, offset);
    state.offsets[filePath] = newOffset;

    for (const cb of callbacks) {
      handleCallback(cb, state);
    }
  }

  saveState(state);
}

// ── Entry ─────────────────────────────────────────────────────────────────────

if (CALLBACK_ARG) {
  // Direct call mode: node content-approval-bridge.js --callback content_approve|4
  log('INFO', `Direct callback: ${CALLBACK_ARG}`);
  const state = loadState();
  handleCallback(CALLBACK_ARG, state);
  process.exit(0);
} else if (ONCE_MODE) {
  log('INFO', 'Content Approval Bridge started (once)');
  poll();
  process.exit(0);
} else {
  log('INFO', `Content Approval Bridge started (polling every ${POLL_INTERVAL}ms)`);
  poll();
  setInterval(poll, POLL_INTERVAL);
}
