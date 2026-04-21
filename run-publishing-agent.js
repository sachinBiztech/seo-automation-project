#!/usr/bin/env node
/**
 * run-publishing-agent.js
 *
 * Triggered by content-approval-bridge.js after Telegram APPROVE.
 * Calls `openclaw agent --agent publishing-agent` which handles:
 *   verify approval → publish to CMS → archive HTML → update sprint sheet → trigger social media
 *
 * Usage:
 *   node run-publishing-agent.js --sprint-id biztechcs_sprint_2026-04-14 --slug odoo-impl-india
 *   node run-publishing-agent.js --sprint-id X --slug Y --dry-run
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const WORKSPACE = '/home/sachin.p/.openclaw/workspace';
const OUTPUTS   = path.join(WORKSPACE, 'seo-automation', 'outputs');

const args      = process.argv.slice(2);
const getArg    = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const SPRINT_ID = getArg('--sprint-id');
const SLUG      = getArg('--slug');
const DRY_RUN   = args.includes('--dry-run');

if (!SPRINT_ID || !SLUG) {
  console.error('ERROR: --sprint-id and --slug are required');
  process.exit(1);
}

// ── Session cleanup ────────────────────────────────────────────────────────────
function clearSession(agentId) {
  const base = path.join(process.env.HOME, '.openclaw', 'agents', agentId);
  const sessionsDir  = path.join(base, 'sessions');
  const sessionsJson = path.join(base, 'sessions.json');

  if (fs.existsSync(sessionsDir)) {
    for (const f of fs.readdirSync(sessionsDir)) {
      fs.unlinkSync(path.join(sessionsDir, f));
    }
  }
  if (fs.existsSync(sessionsJson)) fs.unlinkSync(sessionsJson);
}

// ── Main ───────────────────────────────────────────────────────────────────────
function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Publishing Agent — ${SLUG}`);
  console.log(`Sprint: ${SPRINT_ID}`);
  if (DRY_RUN) console.log('Mode: DRY RUN');
  console.log('═══════════════════════════════════════════════════════\n');

  // Verify approval before calling agent
  const approvalFile = path.join(OUTPUTS, `content-approval-${SPRINT_ID}.json`);
  if (!fs.existsSync(approvalFile)) {
    console.error(`ERROR: content-approval-${SPRINT_ID}.json not found`);
    process.exit(1);
  }
  const approval = JSON.parse(fs.readFileSync(approvalFile, 'utf8'));
  const item = approval.items?.find(i => i.slug === SLUG);
  if (!item) {
    console.error(`ERROR: slug "${SLUG}" not found in approval file`);
    process.exit(1);
  }
  if (item.status !== 'approved') {
    console.error(`ERROR: slug "${SLUG}" not approved (status: ${item.status})`);
    process.exit(1);
  }
  console.log(`✅ Approval verified — approved at ${item.approved_at}`);

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would call: openclaw agent --agent publishing-agent`);
    console.log(`  Message: Publish slug: ${SLUG}, sprint-id: ${SPRINT_ID}`);
    return;
  }

  clearSession('publishing-agent');

  console.log('\n🤖 Starting publishing-agent...\n');
  const result = spawnSync(
    'openclaw',
    [
      'agent', '--agent', 'publishing-agent',
      '--message',
      `Read the file seo-automation/publishing-agent/orchestrator.md and follow ALL instructions exactly. ` +
      `Slug: ${SLUG}. Sprint ID: ${SPRINT_ID}. ` +
      'Do not ask questions — execute all steps sequentially.',
    ],
    { encoding: 'utf8', stdio: 'inherit', timeout: 300000 }
  );

  if (result.status !== 0) {
    console.error('\n💥 Publishing agent failed with exit code:', result.status);
    process.exit(1);
  }

  // Verify publish log written
  const publishLog = path.join(OUTPUTS, `publish-log-${SPRINT_ID}.json`);
  if (fs.existsSync(publishLog)) {
    console.log(`\n✅ Publishing complete: ${SLUG}`);
  } else {
    console.warn('\n⚠️  publish-log not found — check agent output above');
  }

  // Trigger social media agent via run-social-media.js (non-blocking)
  const triggerFile = path.join(OUTPUTS, `social-media-trigger-${SPRINT_ID}.json`);
  if (fs.existsSync(triggerFile)) {
    console.log('\n🤖 Triggering social-media agent (background)...');
    const { spawn } = require('child_process');
    const sm = spawn(
      process.execPath,
      [path.join(__dirname, 'run-social-media.js'), '--sprint-id', SPRINT_ID, '--slug', SLUG],
      { detached: true, stdio: 'ignore' }
    );
    sm.unref();
    console.log('  ✅ Social media agent started in background.');
  } else {
    console.warn('  ⚠️  social-media-trigger not found — social media agent not started');
  }
}

main();
