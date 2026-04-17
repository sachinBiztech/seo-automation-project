#!/usr/bin/env node
/**
 * run-intelligence-pipeline.js — Intelligence Report pipeline runner for BiztechCS
 *
 * Calls `openclaw agent --agent intelligence-report` which internally uses
 * sessions_spawn to run each subskill in an isolated sub-agent context.
 *
 * Usage:
 *   node run-intelligence-pipeline.js              # Full run
 *   node run-intelligence-pipeline.js --dry-run    # Show steps without running
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const WORKSPACE = '/home/sachin.p/.openclaw/workspace';
const OUTPUTS   = path.join(WORKSPACE, 'seo-automation', 'outputs');
const DRY_RUN   = process.argv.includes('--dry-run');

// ── Session cleanup ────────────────────────────────────────────────────────────
function clearSession(agentId) {
  const base = path.join(process.env.HOME, '.openclaw', 'agents', agentId);
  const sessionsDir = path.join(base, 'sessions');
  const sessionsJson = path.join(base, 'sessions.json');

  if (fs.existsSync(sessionsDir)) {
    for (const f of fs.readdirSync(sessionsDir)) {
      fs.unlinkSync(path.join(sessionsDir, f));
    }
    console.log(`  🗑  Cleared stale session files for ${agentId}`);
  }
  if (fs.existsSync(sessionsJson)) {
    fs.unlinkSync(sessionsJson);
    console.log(`  🗑  Cleared sessions.json for ${agentId}`);
  }
}

// ── Output verification ───────────────────────────────────────────────────────
function checkOutputs() {
  const required = [
    'report-summary.json',
    'intelligence-report.md',
    'report-approval.json',
  ];

  console.log('\n── Verifying outputs ──');
  let allOk = true;
  for (const f of required) {
    const full = path.join(OUTPUTS, f);
    if (fs.existsSync(full) && fs.statSync(full).size > 0) {
      console.log(`  ✅ ${f}`);
    } else {
      console.error(`  ❌ MISSING or empty: ${f}`);
      allOk = false;
    }
  }
  return allOk;
}

// ── Main ───────────────────────────────────────────────────────────────────────
function main() {
  console.log('🚀 Intelligence Report Pipeline — BiztechCS');
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);

  if (DRY_RUN) {
    console.log('\n[DRY RUN] Would call: openclaw agent --agent intelligence-report');
    console.log('Steps: GSC → GA4 → Rankings → Odoo → Clarity → Competitor → Algorithm → Analyze → 20Q → Insights → Assemble → PDF → Deliver');
    return;
  }

  clearSession('intelligence-report');

  console.log('\n🤖 Starting intelligence-report agent...\n');

  const result = spawnSync(
    'openclaw',
    [
      'agent', '--agent', 'intelligence-report',
      '--message',
      'Run the full Intelligence Report pipeline from Step 1 to the final step. ' +
      'Execute ALL steps sequentially without stopping. ' +
      'This is an automated pipeline run — follow the orchestrator instructions exactly. ' +
      'Do not skip any step. Do not stop mid-pipeline to ask for confirmation.',
    ],
    { encoding: 'utf8', stdio: 'inherit', timeout: 1800000 }
  );

  if (result.status !== 0) {
    console.error('\n💥 Agent exited with code:', result.status);
    process.exit(1);
  }

  const ok = checkOutputs();
  if (ok) {
    console.log('\n✅ Intelligence Report pipeline complete. Awaiting approval via Telegram.');
  } else {
    console.error('\n⚠️  Some output files are missing. Check the agent log above.');
    process.exit(1);
  }
}

main();
