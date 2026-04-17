#!/usr/bin/env node
/**
 * run-technical-pipeline.js
 *
 * Runner for technical SEO tasks. Called by sprint-pm.js for each Technical task.
 * The technical-seo agent processes all "In Progress" Technical tasks in one run.
 * Subsequent calls for the same sprint day skip the agent and just update task status.
 *
 * Usage:
 *   node run-technical-pipeline.js --sprint-id biztechcs_sprint_2026-04-15 --task-id 1
 *   node run-technical-pipeline.js --sprint-id X --task-id 1 --dry-run
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
  console.log('Technical SEO Pipeline');
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

  // Agent runs once per sprint day — skip if change log already written today
  const today = new Date().toISOString().slice(0, 10);
  const changesLog = path.join(OUTPUTS_DIR, `technical-changes-${today}.md`);

  if (fs.existsSync(changesLog)) {
    console.log(`  ℹ️  technical-changes-${today}.md already exists — skipping agent re-run`);
    console.log(`  Marking task ${TASK_ID} Completed.\n`);
    updateTaskStatus(TASK_ID, 'Completed');
    return;
  }

  if (DRY_RUN) {
    console.log(`  [DRY] Would call: openclaw agent --agent technical-seo`);
    console.log(`  [DRY] Would verify: technical-changes-${today}.md`);
    updateTaskStatus(TASK_ID, 'Completed');
    return;
  }

  clearSession('technical-seo');

  console.log('🤖 Running technical-seo agent...\n');
  const result = spawnSync(
    'openclaw',
    [
      'agent', '--agent', 'technical-seo',
      '--message',
      `Process all In Progress technical tasks for sprint ${SPRINT_ID}. ` +
      'Read sprint-tasks JSON and sprint-plan.json. ' +
      'Write technical briefs and change log. Follow orchestrator instructions exactly.',
    ],
    { encoding: 'utf8', stdio: 'inherit', timeout: 300000 }
  );

  if (result.status !== 0) {
    sendTelegram(`❌ Technical SEO pipeline failed\nSprint: ${SPRINT_ID}\nTask: ${taskTitle}`);
    process.exit(1);
  }

  if (!fs.existsSync(changesLog)) {
    console.warn(`  ⚠️  technical-changes-${today}.md not found — check agent output`);
    sendTelegram(`⚠️ Technical SEO: change log not written\nSprint: ${SPRINT_ID}\nTask: ${taskTitle}`);
  } else {
    console.log(`  ✅ technical-changes-${today}.md written`);
    sendTelegram(`🔧 Technical SEO complete\nSprint: ${SPRINT_ID}\nTask: ${taskTitle}`);
  }

  updateTaskStatus(TASK_ID, 'Completed');
}

main();
