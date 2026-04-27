#!/usr/bin/env node
/**
 * run-pipeline.js — SEO Strategist pipeline runner for BiztechCS
 *
 * The agent handles all steps:
 *   Steps 1-4: Plan generation (Brief → Vectors → Offensives → Assemble)
 *   Step 5:    PDF generation via puppeteer-core (today's date in filename)
 *   Step 6:    Deliver PDF + approval buttons to Telegram
 *
 * Before running, stale sprint output files are deleted so the agent
 * always executes Steps 5 and 6 fresh instead of skipping them.
 *
 * Usage:
 *   node run-pipeline.js              # Full run
 *   node run-pipeline.js --dry-run    # Show steps without running
 *   node run-pipeline.js --force      # Skip pre-condition check (testing only)
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const WORKSPACE  = '/home/sachin.p/.openclaw/workspace';
const OUTPUTS    = path.join(WORKSPACE, 'seo-automation', 'outputs');
const IR_OUT     = path.join(OUTPUTS, 'intelligence-report');
const STRAT_OUT  = path.join(OUTPUTS, 'seo-strategist');
const DRY_RUN    = process.argv.includes('--dry-run');
const FORCE      = process.argv.includes('--force');

// ── Session cleanup ────────────────────────────────────────────────────────────
function clearSession(agentId) {
  const base = path.join(process.env.HOME, '.openclaw', 'agents', agentId);
  const sessionsDir  = path.join(base, 'sessions');
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

// ── Pre-check ─────────────────────────────────────────────────────────────────
function preCheck() {
  const reportApprovalPath = path.join(IR_OUT, 'report-approval.json');
  if (!fs.existsSync(reportApprovalPath)) {
    console.error('❌ report-approval.json missing. Run intelligence-report first.');
    return false;
  }
  const reportApproval = JSON.parse(fs.readFileSync(reportApprovalPath, 'utf8'));
  if (reportApproval.status !== 'approved') {
    console.error(`❌ Intelligence report not approved (status: ${reportApproval.status}). Approve via Telegram first.`);
    return false;
  }
  console.log('  ✅ report-approval.json — approved');
  return true;
}

// ── Clear stale sprint outputs ─────────────────────────────────────────────────
// These files must be deleted before each run so the agent always executes
// Steps 5 (PDF) and 6 (Telegram delivery) fresh. If they exist, the agent
// may see them as already-done and skip those steps.
function clearSprintOutputs() {
  const staleFiles = [
    // Step 1 output — all subskills write/read it from intelligence-report/ not seo-strategist/
    path.join(IR_OUT, 'intelligence-brief-parsed.json'),
    // Step 2 output
    path.join(STRAT_OUT, 'attack-vectors.json'),
    // Step 3 outputs
    path.join(STRAT_OUT, 'content-plan.json'),
    path.join(STRAT_OUT, 'technical-plan.json'),
    path.join(STRAT_OUT, 'offpage-plan.json'),
    // Step 4 outputs
    path.join(STRAT_OUT, 'sprint-plan.json'),
    path.join(STRAT_OUT, 'sprint-plan.md'),
    path.join(STRAT_OUT, 'sprint-plan.html'),
    // Step 4d/4e/4f outputs
    path.join(STRAT_OUT, 'expert-intelligence-map.json'),
    path.join(STRAT_OUT, 'history-rationale.json'),
    // Step 5 output — clearing ensures sprint_id is always from the current sprint-plan.json
    path.join(STRAT_OUT, 'generate-sprint-pdf-status.json'),
    // Step 6 output
    path.join(STRAT_OUT, 'sprint-approval.json'),
  ];
  for (const p of staleFiles) {
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`  🗑  Cleared ${path.basename(p)} (will be regenerated this run)`);
    }
  }
}

// ── Output verification ───────────────────────────────────────────────────────
function checkOutputs() {
  const required = [
    'sprint-plan.json',
    'sprint-plan.md',
    'generate-sprint-pdf-status.json',
    'sprint-approval.json',
  ];

  console.log('\n── Verifying outputs ──');
  let allOk = true;
  for (const f of required) {
    const full = path.join(STRAT_OUT, f);
    if (fs.existsSync(full) && fs.statSync(full).size > 0) {
      console.log(`  ✅ ${f}`);
    } else {
      console.error(`  ❌ MISSING or empty: ${f}`);
      allOk = false;
    }
  }

  // Verify Step 6 actually ran: sprint-approval.json must be "pending" (freshly sent)
  const approvalPath = path.join(STRAT_OUT, 'sprint-approval.json');
  if (fs.existsSync(approvalPath)) {
    const approval = JSON.parse(fs.readFileSync(approvalPath, 'utf8'));
    if (approval.status === 'pending') {
      console.log('  ✅ sprint-approval.json — status: pending (Telegram delivery confirmed)');
    } else {
      console.error(`  ❌ sprint-approval.json status is "${approval.status}" — Step 6 (Telegram delivery) did not run`);
      allOk = false;
    }
  }

  return allOk;
}

// ── Main ───────────────────────────────────────────────────────────────────────
function main() {
  console.log('🚀 SEO Strategist Pipeline — BiztechCS');
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}${FORCE ? ' + FORCE' : ''}`);

  if (DRY_RUN) {
    console.log('\n[DRY RUN] Agent handles all steps:');
    console.log('  Step 1:   Parse Intelligence Brief');
    console.log('  Step 2:   Identify Attack Vectors');
    console.log('  Step 3a:  Build Content Offensive');
    console.log('  Step 3b:  Build Technical Offensive');
    console.log('  Step 3c:  Build Off-Page Offensive');
    console.log('  Step 4:   Assemble Sprint Plan → sprint-plan.json / .md / .html');
    console.log('  Step 5:   Generate PDF → BiztechCS-SEO-Sprint-Plan_<TODAY>.pdf');
    console.log('  Step 6:   Deliver PDF + approval buttons to Telegram');
    return;
  }

  // ── Pre-checks ────────────────────────────────────────────────────────────
  console.log('\n── Pre-checks ──');
  if (!FORCE && !preCheck()) process.exit(1);
  if (FORCE) console.log('  ⚠️  --force: skipping pre-condition checks');

  // ── Clear stale sprint outputs ─────────────────────────────────────────────
  // Must happen BEFORE the agent runs so it executes Steps 5 and 6 fresh
  clearSprintOutputs();

  // ── Clear stale agent session ──────────────────────────────────────────────
  clearSession('seo-strategist');

  console.log('\n🤖 Starting seo-strategist agent (all steps)...\n');

  const result = spawnSync(
    'openclaw',
    [
      'agent', '--agent', 'seo-strategist',
      '--message',
      'Read seo-automation/seo-strategist/orchestrator.md and follow every step inline. ' +
      'Do NOT use any shell script. Do NOT look for .sh files. ' +
      'Read each subskill .md file listed and execute it directly using the read and write tools. ' +
      'Complete all steps from Step 0 through Step 6 without stopping.',
    ],
    { encoding: 'utf8', stdio: 'inherit', timeout: 1800000 }
  );

  if (result.status !== 0) {
    console.error('\n💥 Agent exited with code:', result.status);
    process.exit(1);
  }

  const ok = checkOutputs();
  if (ok) {
    console.log('\n✅ BiztechCS SEO Sprint Plan sent to Telegram. Awaiting human approval.');
  } else {
    console.error('\n⚠️  Pipeline incomplete — Steps 5 or 6 may not have run. Check agent output above.');
    process.exit(1);
  }
}

main();
