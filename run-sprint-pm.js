#!/usr/bin/env node
/**
 * run-sprint-pm.js
 *
 * 1. Clears sprint-pm session
 * 2. Calls `openclaw agent --agent sprint-pm` — agent runs all steps via sessions_spawn internally
 * 3. Verifies output files were written
 * 4. Sends Telegram summary (guaranteed send at runner level — not dependent on agent completing Step 7)
 *
 * Usage:
 *   node run-sprint-pm.js --sprint-id biztechcs_sprint_2026-04-17
 *   node run-sprint-pm.js --sprint-id biztechcs_sprint_2026-04-17 --day 2
 *   node run-sprint-pm.js --sprint-id biztechcs_sprint_2026-04-17 --dry-run
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const WORKSPACE     = '/home/sachin.p/.openclaw/workspace';
const OUTPUTS       = path.join(WORKSPACE, 'seo-automation', 'outputs');
const SPRINT_PM_OUT = path.join(OUTPUTS, 'sprint-pm');
const SOCIAL_OUT    = path.join(OUTPUTS, 'social-media');
const TELEGRAM_CHAT_ID = '-1003829892114';

const args      = process.argv.slice(2);
const getArg    = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const SPRINT_ID = getArg('--sprint-id');
const DAY_ARG   = getArg('--day');
const DRY_RUN   = args.includes('--dry-run');

if (!SPRINT_ID) {
  console.error('ERROR: --sprint-id is required');
  process.exit(1);
}

const TODAY = new Date().toISOString().slice(0, 10);

function clearSession(agentId) {
  const base         = path.join(process.env.HOME, '.openclaw', 'agents', agentId);
  const sessionsDir  = path.join(base, 'sessions');
  const sessionsJson = path.join(base, 'sessions.json');
  if (fs.existsSync(sessionsDir)) {
    for (const f of fs.readdirSync(sessionsDir)) fs.unlinkSync(path.join(sessionsDir, f));
  }
  if (fs.existsSync(sessionsJson)) fs.unlinkSync(sessionsJson);
}

function sendTelegram(text) {
  try {
    execFileSync('openclaw', [
      'message', 'send', '--channel', 'telegram',
      '--target', TELEGRAM_CHAT_ID, '--message', text,
    ], { stdio: ['ignore', 'ignore', 'inherit'], timeout: 15000 });
    console.log('✅ Telegram notification sent');
    return true;
  } catch (e) {
    console.warn('⚠️  Telegram send failed:', e.message);
    return false;
  }
}

function calcSprintDay(sprintStart) {
  const start = new Date(sprintStart);
  const today = new Date(TODAY);
  const diffMs = today - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

function getSprintDay() {
  if (DAY_ARG) return parseInt(DAY_ARG, 10);

  // Try to read sprint start from sprint-approval.json
  const approvalFile = path.join(OUTPUTS, 'seo-strategist', 'sprint-approval.json');
  if (fs.existsSync(approvalFile)) {
    try {
      const approval = JSON.parse(fs.readFileSync(approvalFile, 'utf8'));
      const start = approval.sprint_start || approval.sprint_id?.split('_sprint_')[1];
      if (start) return calcSprintDay(start);
    } catch (_) {}
  }

  // Fallback: parse sprint_id (format: site_sprint_YYYY-MM-DD)
  const parts = SPRINT_ID.split('_sprint_');
  if (parts[1]) return calcSprintDay(parts[1]);
  return 1;
}

function buildTelegramMessage(sprintDay, techFiles, outreachExists, logExists, outreachLogExists, nextTasks) {
  const mode = '(MOCK)';
  const lines = [
    `✅ Sprint PM Day ${sprintDay} complete — Sprint: ${SPRINT_ID}`,
    '',
  ];

  if (techFiles.length > 0) {
    lines.push(`Technical SEO: ✅ ${techFiles.length} brief(s) written ${mode}`);
  } else {
    lines.push(`Technical SEO: ⚠️ no briefs written — no technical tasks today`);
  }

  if (outreachExists) {
    lines.push(`Off-Page SEO: ✅ outreach-package written ${mode}`);
  } else {
    lines.push(`Off-Page SEO: ⚠️ outreach-package not found`);
  }

  if (outreachLogExists) {
    lines.push(`Outreach Manager: ✅ outreach-log written ${mode}`);
  } else {
    lines.push(`Outreach Manager: ⚠️ outreach-log not written`);
  }

  if (!logExists) {
    lines.push(`Sprint PM log: ⚠️ log file not written (agent cut short before Step 7)`);
  }

  lines.push('');

  if (nextTasks.length > 0) {
    lines.push(`Next — Day ${sprintDay + 1}:`);
    nextTasks.slice(0, 3).forEach(t => lines.push(`  • [${t.taskType}] ${t.title.slice(0, 60)}`));
    if (nextTasks.length > 3) lines.push(`  • ...and ${nextTasks.length - 3} more`);
  } else {
    lines.push(`Next: Day ${sprintDay + 1} — no tasks scheduled or sprint complete.`);
  }

  return lines.join('\n');
}

function getNextDayTasks(sprintDay) {
  const tasksFile = path.join(SPRINT_PM_OUT, `sprint-tasks-${SPRINT_ID}.json`);
  if (!fs.existsSync(tasksFile)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(tasksFile, 'utf8'));
    const tasks = data.tasks || [];
    return tasks.filter(t =>
      t.scheduledDay === `Day ${sprintDay + 1}` && t.status === 'Not Started'
    );
  } catch (_) { return []; }
}

function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Sprint PM Runner — ${SPRINT_ID}`);
  console.log(`Date: ${TODAY}${DAY_ARG ? ` (forced Day ${DAY_ARG})` : ''}`);
  if (DRY_RUN) console.log('Mode: DRY RUN');
  console.log('═══════════════════════════════════════════════════════\n');

  const sprintDay = getSprintDay();
  console.log(`Sprint Day: ${sprintDay}`);

  if (DRY_RUN) {
    console.log('[DRY RUN] Would call: openclaw agent --agent sprint-pm');
    console.log(`[DRY RUN] Would send Telegram: Sprint PM Day ${sprintDay} summary`);
    return;
  }

  // ── Step 1: Run sprint-pm orchestrator ───────────────────────────────────────
  // The orchestrator handles all subagent spawning internally via sessions_spawn.
  // No dispatch file is written — all work happens inside the agent session.
  clearSession('sprint-pm');

  const dayMsg = DAY_ARG ? ` Force sprint day to Day ${DAY_ARG} regardless of date calculation.` : '';
  console.log('🤖 Running sprint-pm agent...\n');

  const pmResult = spawnSync(
    'openclaw',
    [
      'agent', '--agent', 'sprint-pm',
      '--message',
      `Run Sprint PM for sprint ${SPRINT_ID}. Today is ${TODAY}.${dayMsg} ` +
      'Read seo-automation/sprint-pm/orchestrator.md and execute ALL steps without skipping. ' +
      'You MUST complete Step 7 (write log + send Telegram) before finishing.',
    ],
    { encoding: 'utf8', stdio: 'inherit', timeout: 300000 }
  );

  if (pmResult.status !== 0) {
    console.error('\n💥 sprint-pm agent failed with exit code:', pmResult.status);
    sendTelegram(
      `❌ Sprint PM Day ${sprintDay} FAILED — Sprint: ${SPRINT_ID}\n` +
      `Agent exited with code ${pmResult.status}. Check logs.`
    );
    process.exit(1);
  }

  // ── Step 2: Verify outputs ────────────────────────────────────────────────────
  console.log('\n── Output verification ─────────────────────────────────');

  const logFile        = path.join(SPRINT_PM_OUT, `sprint-pm-log-${TODAY}.json`);
  const outreachFile   = path.join(SOCIAL_OUT, `outreach-package-${SPRINT_ID}.json`);
  const outreachLog    = path.join(SOCIAL_OUT, `outreach-log-${SPRINT_ID}.json`);
  const techFiles      = fs.existsSync(SPRINT_PM_OUT)
    ? fs.readdirSync(SPRINT_PM_OUT).filter(f => f.startsWith('technical-brief-') || f.startsWith('technical-changes-'))
    : [];

  const logExists          = fs.existsSync(logFile);
  const outreachExists     = fs.existsSync(outreachFile);
  const outreachLogExists  = fs.existsSync(outreachLog);

  if (logExists) {
    const log = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    console.log(`✅ Sprint PM log — Day ${log.sprint_day}`);
    console.log(`   Tasks triggered: ${(log.tasks_triggered || []).length}`);
    console.log(`   Agents: ${(log.agents_dispatched || []).join(', ')}`);
  } else {
    console.warn('⚠️  sprint-pm-log not written — agent was cut short before Step 7');
  }

  if (techFiles.length > 0) {
    console.log(`✅ Technical SEO: ${techFiles.length} file(s) written`);
    techFiles.forEach(f => console.log(`   • ${f}`));
  } else {
    console.warn('⚠️  No technical output files found');
  }

  if (outreachExists) {
    console.log(`✅ Off-Page SEO: outreach-package-${SPRINT_ID}.json written`);
  } else {
    console.warn(`⚠️  outreach-package-${SPRINT_ID}.json not found`);
  }

  if (outreachLogExists) {
    console.log(`✅ Outreach Manager: outreach-log-${SPRINT_ID}.json written`);
  } else {
    console.warn(`⚠️  outreach-log-${SPRINT_ID}.json not found`);
  }

  // ── Step 3: Send Telegram (guaranteed — runs even if agent skipped Step 7) ────
  const nextTasks = getNextDayTasks(sprintDay);
  const msg = buildTelegramMessage(
    sprintDay, techFiles, outreachExists, logExists, outreachLogExists, nextTasks
  );

  console.log('\n── Sending Telegram notification ───────────────────────');
  console.log(msg);
  console.log('');
  sendTelegram(msg);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`✅ Sprint PM Day ${sprintDay} complete`);
  console.log('═══════════════════════════════════════════════════════');
}

main();
