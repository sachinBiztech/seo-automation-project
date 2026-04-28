#!/usr/bin/env node
/**
 * run-publishing-agent.js — thin launcher
 *
 * Calls `openclaw agent --agent publishing-agent`.
 * All business logic lives in publishing-agent/orchestrator.md.
 *
 * Triggered by content-approval-bridge.js after Telegram APPROVE.
 *
 * Usage:
 *   node run-publishing-agent.js --sprint-id biztechcs_sprint_2026-04-27 --slug odoo-impl-india
 *   node run-publishing-agent.js --sprint-id X --slug Y --dry-run
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const WORKSPACE = '/home/sachin.p/.openclaw/workspace';

const args      = process.argv.slice(2);
const getArg    = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const SPRINT_ID = getArg('--sprint-id');
const SLUG      = getArg('--slug');
const DRY_RUN   = args.includes('--dry-run');

if (!SPRINT_ID || !SLUG) {
  console.error('ERROR: --sprint-id and --slug required');
  process.exit(1);
}

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
  console.log(`[DRY] Publishing Agent — Sprint: ${SPRINT_ID} | Slug: ${SLUG}`);
  console.log('[DRY] Would call: openclaw agent --agent publishing-agent');
  process.exit(0);
}

clearSession('publishing-agent');
console.log(`Publishing Agent Launcher — ${SPRINT_ID} / ${SLUG}`);
console.log('🤖 Launching publishing-agent (all steps run inside agent)...\n');

execFileSync('openclaw', [
  'agent', '--agent', 'publishing-agent',
  '--message',
  `Run publishing agent for sprint ${SPRINT_ID} slug ${SLUG}. ` +
  'Read seo-automation/publishing-agent/orchestrator.md and execute ALL 7 steps: ' +
  'verify approval, load metadata, publish to CMS (MOCK), archive HTML, ' +
  'update sprint tasks (tasks array format), write social media trigger, send Telegram confirmation.',
], { stdio: 'inherit', timeout: 120000 });

console.log('\n✅ Publishing agent complete.');
