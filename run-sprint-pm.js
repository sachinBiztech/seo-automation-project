#!/usr/bin/env node
/**
 * run-sprint-pm.js — thin launcher
 *
 * 1. Calls `openclaw agent --agent sprint-pm` — agent runs all steps via
 *    sessions_spawn internally (day calc, task filtering, agent dispatch, log, Telegram).
 * 2. After agent completes, sends a guaranteed Telegram fallback in case the
 *    agent was cut short before its own Step 7.
 *
 * All orchestration logic lives in sprint-pm/orchestrator.md.
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
const TELEGRAM_CHAT_ID = '-1003829892114';

const args      = process.argv.slice(2);
const getArg    = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const SPRINT_ID = getArg('--sprint-id');
const DAY_ARG   = getArg('--day');
const DRY_RUN   = args.includes('--dry-run');

if (!SPRINT_ID) { console.error('ERROR: --sprint-id is required'); process.exit(1); }

const TODAY = new Date().toISOString().slice(0, 10);

function clearSession(agentId) {
  const base        = path.join(process.env.HOME, '.openclaw', 'agents', agentId);
  const sessionsDir = path.join(base, 'sessions');
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

function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Sprint PM Launcher — ${SPRINT_ID}`);
  console.log(`Date: ${TODAY}${DAY_ARG ? ` (forced Day ${DAY_ARG})` : ''}`);
  if (DRY_RUN) console.log('Mode: DRY RUN');
  console.log('═══════════════════════════════════════════════════════\n');

  if (DRY_RUN) {
    console.log('[DRY] Would call: openclaw agent --agent sprint-pm');
    return;
  }

  // ── Run sprint-pm orchestrator ─────────────────────────────────────────────
  clearSession('sprint-pm');

  const dayMsg = DAY_ARG ? ` Force sprint day to Day ${DAY_ARG} regardless of date calculation.` : '';
  console.log('🤖 Launching sprint-pm agent (all steps run inside agent)...\n');

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
      `❌ Sprint PM FAILED — Sprint: ${SPRINT_ID}\n` +
      `Agent exited with code ${pmResult.status}. Check logs.`
    );
    process.exit(1);
  }

  // ── Verify log was written; if not, write fallback log + Telegram ──────────
  const logFile = path.join(SPRINT_PM_OUT, `sprint-pm-log-${TODAY}.json`);
  if (!fs.existsSync(logFile)) {
    console.warn('\n⚠️  sprint-pm-log not written — agent skipped Step 7. Writing fallback log...');

    // Calculate sprint day
    let sprintDay = DAY_ARG ? parseInt(DAY_ARG, 10) : 1;
    const approvalPath = path.join(OUTPUTS, 'seo-strategist', 'sprint-approval.json');
    if (!DAY_ARG && fs.existsSync(approvalPath)) {
      try {
        const approval = JSON.parse(fs.readFileSync(approvalPath, 'utf8'));
        const start = new Date(approval.sprint_start);
        const todayDate = new Date(TODAY);
        sprintDay = Math.floor((todayDate - start) / 86400000) + 1;
      } catch (_) {}
    }

    // Read sprint-tasks to reconstruct what was dispatched today
    const tasksPath = path.join(SPRINT_PM_OUT, `sprint-tasks-${SPRINT_ID}.json`);
    let tasksTriggered = [], tasksReassigned = [];
    let technicalCount = 0, offpageCount = 0, contentCount = 0;
    const agentsDispatched = [];

    if (fs.existsSync(tasksPath)) {
      try {
        const data   = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
        const tasks  = data.tasks || data.items || [];
        const dayKey = `Day ${sprintDay}`;
        for (const t of tasks) {
          if (t.scheduledDay !== dayKey) continue;
          if (['In Progress', 'Pending Review', 'Done'].includes(t.status)) {
            tasksTriggered.push(t.title);
            if (t.taskType === 'Technical') {
              technicalCount++;
              if (!agentsDispatched.includes('technical-seo')) agentsDispatched.push('technical-seo');
            } else if (t.taskType === 'Off-Page') {
              offpageCount++;
              if (!agentsDispatched.includes('off-page-seo')) agentsDispatched.push('off-page-seo');
              if (!agentsDispatched.includes('outreach-manager')) agentsDispatched.push('outreach-manager');
            } else if (t.taskType === 'Content') {
              contentCount++;
              if (!agentsDispatched.includes('content-pipeline')) agentsDispatched.push('content-pipeline');
            }
          }
        }
      } catch (_) {}
    }

    const fallbackLog = {
      run_date:         new Date().toISOString(),
      run_date_local:   TODAY,
      sprint_id:        SPRINT_ID,
      site:             'BiztechCS',
      sprint_day:       sprintDay,
      sprint_complete:  false,
      tasks_triggered:  tasksTriggered,
      tasks_reassigned: tasksReassigned,
      technical_count:  technicalCount,
      offpage_count:    offpageCount,
      content_count:    contentCount,
      agents_dispatched: agentsDispatched,
      note: 'fallback_log — agent skipped Step 7; log written by JS runner',
    };

    fs.writeFileSync(logFile, JSON.stringify(fallbackLog, null, 2));
    console.log(`✅ Fallback log written: sprint-pm-log-${TODAY}.json`);
    sendTelegram(
      `✅ Sprint PM Day ${sprintDay} complete — Sprint: ${SPRINT_ID}\n` +
      `Date: ${TODAY}\n` +
      `Technical: ${technicalCount} task(s) | Content: ${contentCount} task(s) | Off-Page: ${offpageCount} task(s)\n` +
      `Agents: ${agentsDispatched.join(', ') || 'none'}\n` +
      `⚠️ Log written by JS runner fallback (agent skipped Step 7)`
    );
  } else {
    console.log(`\n✅ Sprint PM log written: sprint-pm-log-${TODAY}.json`);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ Sprint PM complete');
  console.log('═══════════════════════════════════════════════════════');
}

main();
