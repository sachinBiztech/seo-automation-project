#!/usr/bin/env node
/**
 * run-offpage-pipeline.js
 *
 * Runner for off-page SEO tasks. Called by sprint-pm.js for each Off-Page task.
 * The off-page-seo agent runs once per sprint (produces the full outreach package).
 * Subsequent calls for the same sprint skip the agent and just update task status.
 * Then outreach-manager is called once to send emails (MOCK: log only).
 *
 * Usage:
 *   node run-offpage-pipeline.js --sprint-id biztechcs_sprint_2026-04-15 --task-id 5
 *   node run-offpage-pipeline.js --sprint-id X --task-id 5 --dry-run
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const WORKSPACE   = '/home/sachin.p/.openclaw/workspace';
const OUTPUTS_DIR = path.join(WORKSPACE, 'seo-automation', 'outputs');
const TELEGRAM_ID = '-1003829892114';

const args      = process.argv.slice(2);
const getArg    = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const SPRINT_ID = getArg('--sprint-id');
const TASK_ID   = getArg('--task-id') ? parseInt(getArg('--task-id'), 10) : null;
const DRY_RUN   = args.includes('--dry-run');

if (!SPRINT_ID) { console.error('ERROR: --sprint-id required'); process.exit(1); }

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function updateTaskStatus(taskId, status) {
  if (!taskId) return;
  const tasksFile = path.join(OUTPUTS_DIR, `sprint-tasks-${SPRINT_ID}.json`);
  const data = readJson(tasksFile);
  if (!data) return;
  const task = data.tasks.find(t => t.sr === taskId);
  if (!task) return;
  task.status = status;
  if (status === 'Completed') task.completed = new Date().toISOString();
  if (DRY_RUN) { console.log(`  [DRY] Task ${taskId} status → ${status}`); return; }
  fs.writeFileSync(tasksFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`  📋 Task ${taskId} status → ${status}`);
}

function sendTelegram(message) {
  console.log('\n[TELEGRAM]');
  console.log(message);
  console.log('[/TELEGRAM]\n');
  if (DRY_RUN) return;
  const r = spawnSync('openclaw', [
    'message', 'send', '--channel', 'telegram', '--target', TELEGRAM_ID, '--message', message,
  ], { encoding: 'utf8', timeout: 30000 });
  if (r.status !== 0) console.warn(`  ⚠️  Telegram: ${r.stderr || r.stdout || ''}`);
  else console.log('  ✅ Telegram sent.');
}

function clearSession(agentId) {
  const base = path.join(process.env.HOME, '.openclaw', 'agents', agentId);
  const sessionsDir  = path.join(base, 'sessions');
  const sessionsJson = path.join(base, 'sessions.json');
  if (fs.existsSync(sessionsDir)) {
    for (const f of fs.readdirSync(sessionsDir)) fs.unlinkSync(path.join(sessionsDir, f));
  }
  if (fs.existsSync(sessionsJson)) fs.unlinkSync(sessionsJson);
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('Off-Page SEO Pipeline');
  console.log(`Sprint: ${SPRINT_ID} | Task: ${TASK_ID ?? 'all'}`);
  if (DRY_RUN) console.log('Mode: DRY RUN');
  console.log('═══════════════════════════════════════════════════════\n');

  const tasksFile = path.join(OUTPUTS_DIR, `sprint-tasks-${SPRINT_ID}.json`);
  const data = readJson(tasksFile);
  if (!data) { console.error(`ERROR: sprint-tasks-${SPRINT_ID}.json not found`); process.exit(1); }

  let taskTitle = `Task ${TASK_ID}`;
  if (TASK_ID) {
    const task = data.tasks.find(t => t.sr === TASK_ID);
    if (task) taskTitle = task.title;
  }

  // Agent runs once per sprint — skip if outreach package already exists
  const outreachPkg  = path.join(OUTPUTS_DIR, `outreach-package-${SPRINT_ID}.json`);
  const manualQueue  = path.join(OUTPUTS_DIR, `manual-queue-${SPRINT_ID}.md`);
  const packageExists = fs.existsSync(outreachPkg);

  if (packageExists) {
    console.log(`  ℹ️  outreach-package-${SPRINT_ID}.json already exists — skipping agent re-run`);
    console.log(`  Marking task ${TASK_ID} Completed.\n`);
    updateTaskStatus(TASK_ID, 'Completed');
    return;
  }

  if (DRY_RUN) {
    console.log(`  [DRY] Would call: openclaw agent --agent off-page-seo`);
    console.log(`  [DRY] Would call: openclaw agent --agent outreach-manager`);
    console.log(`  [DRY] Would verify: outreach-package-${SPRINT_ID}.json`);
    updateTaskStatus(TASK_ID, 'Completed');
    return;
  }

  // Step 1 — off-page-seo agent (produces outreach package + manual queue)
  clearSession('off-page-seo');
  console.log('🤖 Running off-page-seo agent...\n');
  const step1 = spawnSync(
    'openclaw',
    [
      'agent', '--agent', 'off-page-seo',
      '--message',
      `Process off-page tasks for sprint ${SPRINT_ID}. ` +
      'Read seo-automation/outputs/sprint-plan.json and sprint-tasks JSON. ' +
      'Write outreach-package and manual-queue files. Follow orchestrator instructions exactly.',
    ],
    { encoding: 'utf8', stdio: 'inherit', timeout: 300000 }
  );

  if (step1.status !== 0) {
    sendTelegram(`❌ Off-Page SEO pipeline failed at Step 1 (outreach package)\nSprint: ${SPRINT_ID}`);
    process.exit(1);
  }

  if (!fs.existsSync(outreachPkg)) {
    console.warn(`  ⚠️  outreach-package-${SPRINT_ID}.json not found — check agent output`);
    sendTelegram(`⚠️ Off-Page SEO: outreach package not written\nSprint: ${SPRINT_ID}`);
    process.exit(1);
  }

  // Step 2 — outreach-manager agent (sends emails — MOCK: log only)
  clearSession('outreach-manager');
  console.log('\n🤖 Running outreach-manager agent...\n');
  const step2 = spawnSync(
    'openclaw',
    [
      'agent', '--agent', 'outreach-manager',
      '--message',
      `Send outreach emails for sprint ${SPRINT_ID}. ` +
      'Read seo-automation/outputs/outreach-package JSON. ' +
      'Mode is MOCK — log all sends, do not call Odoo. Follow orchestrator exactly.',
    ],
    { encoding: 'utf8', stdio: 'inherit', timeout: 300000 }
  );

  if (step2.status !== 0) {
    console.warn('  ⚠️  outreach-manager failed — outreach package still ready, continuing');
  }

  // Telegram summary
  let pkgData = readJson(outreachPkg) || {};
  const emailCount   = (pkgData.backlink_emails?.length || 0) + (pkgData.guest_post_pitches?.length || 0);
  const queueExists  = fs.existsSync(manualQueue);
  sendTelegram(
    `🔗 Off-Page SEO complete\n` +
    `Sprint: ${SPRINT_ID}\n` +
    `✅ ${emailCount} outreach email(s) queued\n` +
    (queueExists ? `📋 Manual queue ready: outputs/manual-queue-${SPRINT_ID}.md` : '')
  );

  updateTaskStatus(TASK_ID, 'Completed');
}

main();
