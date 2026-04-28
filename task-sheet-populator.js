#!/usr/bin/env node
/**
 * task-sheet-populator.js — thin launcher
 *
 * Calls `openclaw agent --agent task-sheet-populator`.
 * All scheduling logic (P1/P2/Optional day assignment) lives in:
 *   task-sheet-populator/orchestrator.md
 *
 * Usage:
 *   node task-sheet-populator.js
 *   node task-sheet-populator.js --sprint-id biztechcs_sprint_2026-04-27
 *   node task-sheet-populator.js --dry-run
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const args      = process.argv.slice(2);
const DRY_RUN   = args.includes('--dry-run');
const getArg    = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const SPRINT_ID = getArg('--sprint-id');

function clearSession(agentId) {
  const base        = path.join(process.env.HOME, '.openclaw', 'agents', agentId);
  const sessionsDir = path.join(base, 'sessions');
  const sessionsJson = path.join(base, 'sessions.json');
  if (fs.existsSync(sessionsDir)) {
    for (const f of fs.readdirSync(sessionsDir)) fs.unlinkSync(path.join(sessionsDir, f));
  }
  if (fs.existsSync(sessionsJson)) fs.unlinkSync(sessionsJson);
}

if (DRY_RUN) {
  console.log('[DRY] Task Sheet Populator — would call: openclaw agent --agent task-sheet-populator');
  process.exit(0);
}

clearSession('task-sheet-populator');
console.log('Task Sheet Populator Launcher');
console.log('🤖 Launching task-sheet-populator agent...\n');

const sprintMsg = SPRINT_ID ? ` Sprint ID: ${SPRINT_ID}.` : '';
execFileSync('openclaw', [
  'agent', '--agent', 'task-sheet-populator',
  '--message',
  `Run the task sheet populator.${sprintMsg} ` +
  'Read seo-automation/task-sheet-populator/orchestrator.md and execute ALL steps: ' +
  'verify approval, read sprint plan + tiered options, build task rows with correct day scheduling ' +
  '(P1 content → Day 2/4 capped at Day 5 | P2 content → Day 5/7/9 capped at Day 9 | ' +
  'Optional → Day 8/10 capped at Day 10 | Technical + Off-Page → Day 1 | NO task beyond Day 10), ' +
  'write sprint-tasks JSON and CSV, send Telegram confirmation.',
], { stdio: 'inherit', timeout: 120000 });

console.log('\n✅ Task sheet populator complete.');
