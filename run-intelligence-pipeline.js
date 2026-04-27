#!/usr/bin/env node
/**
 * run-intelligence-pipeline.js — Intelligence Report pipeline runner for BiztechCS
 *
 * Runs in TWO phases to avoid context exhaustion:
 *   Phase 1 (Steps 1–8):  Data collection — GSC, GA4, Rankings, Odoo, Clarity,
 *                          Competitor, Algorithm, Analyze, 20 Questions
 *   Phase 2 (Steps 9a–11): Assembly — Insights, Assemble Report, PDF, Telegram
 *
 * Usage:
 *   node run-intelligence-pipeline.js              # Full run (Phase 1 + Phase 2)
 *   node run-intelligence-pipeline.js --dry-run    # Show steps without running
 *   node run-intelligence-pipeline.js --phase 1    # Phase 1 only (Steps 1–8)
 *   node run-intelligence-pipeline.js --phase 2    # Phase 2 only (Steps 9a–11)
 *
 * Direct openclaw command (same as this runner):
 *   cd /home/sachin.p/.openclaw/workspace/seo-automation
 *   openclaw agent --agent intelligence-report --message "PHASE 1 ONLY: Run Steps 1 to 8..."
 *   openclaw agent --agent intelligence-report --message "PHASE 2 ONLY: Run Steps 9a to 11..."
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const WORKSPACE = '/home/sachin.p/.openclaw/workspace';
const OUTPUTS   = path.join(WORKSPACE, 'seo-automation', 'outputs');
const IR_OUT    = path.join(OUTPUTS, 'intelligence-report');
const DRY_RUN   = process.argv.includes('--dry-run');

const phaseIdx  = process.argv.indexOf('--phase');
const PHASE_ARG = phaseIdx !== -1 ? process.argv[phaseIdx + 1] : null;  // '1', '2', or null

// Phase 1 message — PHASE 1 ONLY trigger + defer all step paths to the orchestrator
const PHASE1_MSG =
  'PHASE 1 ONLY: Read seo-automation/intelligence-report/orchestrator.md and execute ' +
  'Steps 1 through 8 exactly as the orchestrator specifies. ' +
  'After Step 8 is complete, STOP. Do NOT run Steps 9a, 9b, 10, or 11. ' +
  'This is an automated pipeline run — execute without stopping or asking for confirmation.';

// Phase 2 message — PHASE 2 ONLY trigger + defer all step paths to the orchestrator
const PHASE2_MSG =
  'PHASE 2 ONLY: Read seo-automation/intelligence-report/orchestrator.md and execute ' +
  'Steps 9a, 9b, 10, and 11 exactly as the orchestrator specifies. ' +
  'Steps 1–8 are already complete — all data files exist in seo-automation/outputs/intelligence-report/. ' +
  'Do NOT re-run Steps 1–8. ' +
  'This is an automated pipeline run — execute without stopping or asking for confirmation.';

// Files cleared before Phase 1 (full run) to ensure fresh data
const PHASE1_OUTPUTS = [
  'gsc-findings.json', 'ga4-findings.json', 'ranking-findings.json',
  'odoo-findings.json', 'clarity-findings.json', 'competitor-findings.json',
  'algorithm-findings.json', 'analysis-findings.json',
  'research-findings.json', 'competitor-position-table.json',
];

// Files cleared before Phase 2 to ensure fresh assembly
const PHASE2_OUTPUTS = [
  'insights.json',
  'report-summary.json', 'intelligence-report.md', 'intelligence-report.html',
  'generate-pdf-status.json', 'report-approval.json', 'telegram-payload.json',
];

// ── Session cleanup ────────────────────────────────────────────────────────────
function clearSession(agentId) {
  const base = path.join(process.env.HOME, '.openclaw', 'agents', agentId);
  const sessionsDir  = path.join(base, 'sessions');
  const sessionsJson = path.join(base, 'sessions.json');

  if (fs.existsSync(sessionsDir)) {
    for (const f of fs.readdirSync(sessionsDir)) {
      fs.unlinkSync(path.join(sessionsDir, f));
    }
    console.log(`  🗑  Cleared stale session files for intelligence-report`);
  }
  if (fs.existsSync(sessionsJson)) {
    fs.unlinkSync(sessionsJson);
    console.log(`  🗑  Cleared sessions.json for intelligence-report`);
  }
}

// ── Clear a list of output files ──────────────────────────────────────────────
function clearOutputs(files) {
  for (const f of files) {
    const full = path.join(IR_OUT, f);
    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
      console.log(`  🗑  Cleared ${f}`);
    }
  }
}

// ── Run one openclaw agent call ───────────────────────────────────────────────
function runAgent(message, timeoutMs = 3600000) {
  clearSession('intelligence-report');
  console.log('\n🤖 Calling openclaw agent --agent intelligence-report\n');

  const result = spawnSync(
    'openclaw',
    ['agent', '--agent', 'intelligence-report', '--message', message],
    { encoding: 'utf8', stdio: 'inherit', timeout: timeoutMs }
  );

  return result.status === 0;
}

// ── Phase 1 verification ──────────────────────────────────────────────────────
function checkPhase1() {
  const required = [
    'gsc-findings.json', 'ga4-findings.json', 'ranking-findings.json',
    'odoo-findings.json', 'analysis-findings.json',
    'research-findings.json', 'competitor-position-table.json',
  ];
  console.log('\n── Phase 1 outputs ──');
  let ok = true;
  for (const f of required) {
    const full = path.join(IR_OUT, f);
    if (fs.existsSync(full) && fs.statSync(full).size > 0) {
      console.log(`  ✅ ${f}`);
    } else {
      console.error(`  ❌ MISSING: ${f}`);
      ok = false;
    }
  }
  return ok;
}

// ── Phase 2 verification ──────────────────────────────────────────────────────
function checkPhase2() {
  const required = [
    'insights.json',
    'report-summary.json',
    'intelligence-report.md',
    'competitor-position-table.json',
    'report-approval.json',
  ];
  console.log('\n── Phase 2 outputs ──');
  let ok = true;
  for (const f of required) {
    const full = path.join(IR_OUT, f);
    if (fs.existsSync(full) && fs.statSync(full).size > 0) {
      console.log(`  ✅ ${f}`);
    } else {
      console.error(`  ❌ MISSING: ${f}`);
      ok = false;
    }
  }
  return ok;
}

// ── Main ───────────────────────────────────────────────────────────────────────
function main() {
  console.log('🚀 Intelligence Report Pipeline — BiztechCS');
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);

  const runPhase1 = !PHASE_ARG || PHASE_ARG === '1';
  const runPhase2 = !PHASE_ARG || PHASE_ARG === '2';

  if (PHASE_ARG && !['1','2'].includes(PHASE_ARG)) {
    console.error(`❌ Unknown --phase "${PHASE_ARG}". Use --phase 1 or --phase 2.`);
    process.exit(1);
  }

  if (DRY_RUN) {
    if (runPhase1) {
      console.log('\n[DRY RUN] Phase 1: openclaw agent --agent intelligence-report');
      console.log(`  Message: "${PHASE1_MSG.slice(0, 80)}..."`);
    }
    if (runPhase2) {
      console.log('\n[DRY RUN] Phase 2: openclaw agent --agent intelligence-report');
      console.log(`  Message: "${PHASE2_MSG.slice(0, 80)}..."`);
    }
    return;
  }

  // ── Phase 1 ────────────────────────────────────────────────────────────────
  if (runPhase1) {
    console.log('\n━━━ PHASE 1: Steps 1–8 (Data Collection) ━━━');
    // Only pre-clear Phase 1 data files when explicitly running Phase 1 alone.
    // On a full run the agent overwrites them naturally — we never delete them
    // up-front so a stray full-run from the workspace cron can't wipe good data.
    if (PHASE_ARG === '1') {
      console.log('── Clearing Phase 1 outputs ──');
      clearOutputs(PHASE1_OUTPUTS);
    }

    const ok = runAgent(PHASE1_MSG);
    if (!ok) {
      console.error('\n💥 Phase 1 agent exited with error.');
      process.exit(1);
    }
    if (!checkPhase1()) {
      console.error('\n⚠️  Phase 1 outputs incomplete. Fix before running Phase 2.');
      process.exit(1);
    }
    console.log('\n✅ Phase 1 complete.\n');
  }

  // ── Phase 2 ────────────────────────────────────────────────────────────────
  if (runPhase2) {
    console.log('\n━━━ PHASE 2: Steps 9a–11 (Assembly + PDF + Telegram) ━━━');
    console.log('── Clearing Phase 2 outputs ──');
    clearOutputs(PHASE2_OUTPUTS);

    const ok = runAgent(PHASE2_MSG);
    if (!ok) {
      console.error('\n💥 Phase 2 agent exited with error.');
      process.exit(1);
    }
    if (!checkPhase2()) {
      console.error('\n⚠️  Phase 2 outputs incomplete. Check agent log above.');
      process.exit(1);
    }

    // ── Send Telegram from the runner (agent cannot run CLI commands reliably) ──
    const payloadPath = path.join(IR_OUT, 'telegram-payload.json');
    if (fs.existsSync(payloadPath)) {
      try {
        const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
        console.log('\n📨 Sending Telegram notification...');
        const tg = spawnSync(
          'openclaw',
          ['message', 'send', '--channel', payload.channel, '--target', payload.target, '--message', payload.message],
          { encoding: 'utf8', stdio: 'inherit' }
        );
        if (tg.status === 0) {
          console.log('✅ Telegram notification sent.');
        } else {
          console.error('⚠️  Telegram send failed (non-zero exit). Check openclaw config.');
        }
      } catch (e) {
        console.error('⚠️  Failed to read telegram-payload.json:', e.message);
      }
    } else {
      console.error('⚠️  telegram-payload.json not found — agent did not write it. Telegram not sent.');
    }

    console.log('\n✅ Intelligence Report pipeline complete.');
  }
}

main();
