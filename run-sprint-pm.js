#!/usr/bin/env node
/**
 * run-sprint-pm.js
 *
 * 1. Clears sprint-pm session
 * 2. Calls `openclaw agent --agent sprint-pm` to plan the day
 * 3. Reads sprint-pm-dispatch-[date].json
 * 4. Spawns each agent listed in the dispatch (technical-seo, off-page-seo, content-pipeline)
 *
 * Usage:
 *   node run-sprint-pm.js --sprint-id biztechcs_sprint_2026-04-17
 *   node run-sprint-pm.js --sprint-id biztechcs_sprint_2026-04-17 --day 2
 *   node run-sprint-pm.js --sprint-id biztechcs_sprint_2026-04-17 --dry-run
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync, spawn } = require('child_process');

const WORKSPACE   = '/home/sachin.p/.openclaw/workspace';
const OUTPUTS     = path.join(WORKSPACE, 'seo-automation', 'outputs');
const SPRINT_PM_OUT = path.join(OUTPUTS, 'sprint-pm');

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
  const base        = path.join(process.env.HOME, '.openclaw', 'agents', agentId);
  const sessionsDir = path.join(base, 'sessions');
  const sessionsJson = path.join(base, 'sessions.json');
  if (fs.existsSync(sessionsDir)) {
    for (const f of fs.readdirSync(sessionsDir)) fs.unlinkSync(path.join(sessionsDir, f));
  }
  if (fs.existsSync(sessionsJson)) fs.unlinkSync(sessionsJson);
}

function clearAgentSession(agentId) {
  const base        = path.join(process.env.HOME, '.openclaw', 'agents', agentId);
  const sessionsDir = path.join(base, 'sessions');
  const sessionsJson = path.join(base, 'sessions.json');
  if (fs.existsSync(sessionsDir)) {
    for (const f of fs.readdirSync(sessionsDir)) fs.unlinkSync(path.join(sessionsDir, f));
  }
  if (fs.existsSync(sessionsJson)) fs.unlinkSync(sessionsJson);
}

function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Sprint PM Runner — ${SPRINT_ID}`);
  console.log(`Date: ${TODAY}${DAY_ARG ? ` (forced Day ${DAY_ARG})` : ''}`);
  if (DRY_RUN) console.log('Mode: DRY RUN');
  console.log('═══════════════════════════════════════════════════════\n');

  if (DRY_RUN) {
    console.log('[DRY RUN] Would call: openclaw agent --agent sprint-pm');
    return;
  }

  // ── Step 1: Run sprint-pm planning agent ─────────────────────────────────────
  clearSession('sprint-pm');

  const dayMsg = DAY_ARG ? ` Force sprint day to Day ${DAY_ARG} regardless of date calculation.` : '';
  console.log('🤖 Running sprint-pm agent (planning phase)...\n');

  const pmResult = spawnSync(
    'openclaw',
    [
      'agent', '--agent', 'sprint-pm',
      '--message',
      `Run Sprint PM for sprint ${SPRINT_ID}. Today is ${TODAY}.${dayMsg} ` +
      'Read seo-automation/sprint-pm/orchestrator.md and execute all steps. ' +
      'Write the dispatch manifest and log before finishing.',
    ],
    { encoding: 'utf8', stdio: 'inherit', timeout: 180000 }
  );

  if (pmResult.status !== 0) {
    console.error('\n💥 sprint-pm agent failed:', pmResult.status);
    process.exit(1);
  }

  // ── Step 2: Read dispatch manifest ───────────────────────────────────────────
  const dispatchFile = path.join(SPRINT_PM_OUT, `sprint-pm-dispatch-${TODAY}.json`);
  if (!fs.existsSync(dispatchFile)) {
    console.warn('\n⚠️  No dispatch file found — no tasks scheduled for today or agent skipped it.');
    process.exit(0);
  }

  const dispatch = JSON.parse(fs.readFileSync(dispatchFile, 'utf8'));
  const jobs = dispatch.dispatch || [];

  if (jobs.length === 0) {
    console.log('\n✅ No agents to dispatch for today.');
    process.exit(0);
  }

  console.log(`\n📋 Dispatch: ${jobs.length} agent(s) to run for Day ${dispatch.sprint_day}\n`);

  // ── Step 3: Spawn each agent ──────────────────────────────────────────────────
  for (const job of jobs) {
    const { agent, message } = job;
    console.log(`\n🤖 Starting agent: ${agent}`);
    console.log(`   Message: ${message.slice(0, 100)}...`);

    clearAgentSession(agent);

    const result = spawnSync(
      'openclaw',
      ['agent', '--agent', agent, '--message', message],
      { encoding: 'utf8', stdio: 'inherit', timeout: 300000 }
    );

    if (result.status !== 0) {
      console.error(`\n💥 Agent "${agent}" failed with exit code: ${result.status}`);
      // Continue with remaining agents — don't block pipeline on one failure
    } else {
      console.log(`✅ Agent "${agent}" completed.`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`✅ Sprint PM Day ${dispatch.sprint_day} complete — ${jobs.length} agent(s) dispatched`);
  console.log('═══════════════════════════════════════════════════════');
}

main();
