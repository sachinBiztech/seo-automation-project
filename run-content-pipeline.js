#!/usr/bin/env node
/**
 * run-content-pipeline.js — thin launcher
 *
 * 1. Writes pipeline-context-[task_id].json  (seed file the agent reads)
 * 2. Calls `openclaw agent --agent content-pipeline` — agent runs all 5 steps
 *    internally including the word count gate, content-approval write, and
 *    Telegram approval request.
 *
 * All pipeline business logic lives in content-pipeline/orchestrator.md.
 *
 * Usage:
 *   node run-content-pipeline.js --sprint-id biztechcs_sprint_2026-04-27 --task-id 6
 *   node run-content-pipeline.js --sprint-id X --task-id 4 --from editor
 *   node run-content-pipeline.js --sprint-id X --slug my-slug --from writer
 *   node run-content-pipeline.js --sprint-id X --task-id 4 --dry-run
 */

'use strict';

const fs            = require('fs');
const path          = require('path');
const { execFileSync } = require('child_process');

const WORKSPACE     = '/home/sachin.p/.openclaw/workspace';
const SEO_DIR       = path.join(WORKSPACE, 'seo-automation');
const OUTPUTS_DIR   = path.join(SEO_DIR, 'outputs');
const SPRINT_PM_OUT = path.join(OUTPUTS_DIR, 'sprint-pm');
const CONTENT_OUT   = path.join(OUTPUTS_DIR, 'content-pipeline');

const args          = process.argv.slice(2);
const DRY_RUN       = args.includes('--dry-run');
const getArg        = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const SPRINT_ID     = getArg('--sprint-id');
const TASK_ID       = getArg('--task-id') ? parseInt(getArg('--task-id'), 10) : null;
const FROM_STEP     = getArg('--from');
const SLUG_OVERRIDE = getArg('--slug');

if (!SPRINT_ID) { console.error('ERROR: --sprint-id required'); process.exit(1); }

function clearSession(agentId) {
  const base        = path.join(process.env.HOME, '.openclaw', 'agents', agentId);
  const sessionsDir = path.join(base, 'sessions');
  const sessionsJson = path.join(base, 'sessions.json');
  if (fs.existsSync(sessionsDir)) {
    for (const f of fs.readdirSync(sessionsDir)) fs.unlinkSync(path.join(sessionsDir, f));
  }
  if (fs.existsSync(sessionsJson)) fs.unlinkSync(sessionsJson);
}

function makeSlug(title, keyword) {
  const base = keyword || title;
  return base.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
}

function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Content Pipeline Launcher — ${SPRINT_ID}`);
  if (DRY_RUN)   console.log('Mode: DRY RUN');
  if (FROM_STEP) console.log(`Resume from: ${FROM_STEP}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // ── Resolve task metadata ────────────────────────────────────────────────────
  let task = null;
  let slug = SLUG_OVERRIDE;

  if (TASK_ID) {
    const tasksFile = path.join(SPRINT_PM_OUT, `sprint-tasks-${SPRINT_ID}.json`);
    if (!fs.existsSync(tasksFile)) {
      console.error(`ERROR: sprint-tasks-${SPRINT_ID}.json not found`);
      process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(tasksFile, 'utf8'));
    task = (data.tasks || []).find(t => t.sr === TASK_ID);
    if (!task) { console.error(`ERROR: Task ID ${TASK_ID} not found`); process.exit(1); }
    if (task.taskType !== 'Content') {
      console.error(`ERROR: Task ${TASK_ID} is not Content type`);
      process.exit(1);
    }

    const kwMatch = task.notes?.match(/Keyword:\s*([^|]+)/);
    const keyword = kwMatch ? kwMatch[1].trim() : null;
    if (!slug) slug = makeSlug(task.title, keyword);

    console.log(`Task #${task.sr}: ${task.title}`);
    console.log(`Author: ${task.authorOwner} | Priority: ${task.priority}\n`);
  }

  if (!slug) { console.error('ERROR: --task-id or --slug required'); process.exit(1); }
  console.log(`Slug: ${slug}\n`);

  const kwMatch     = task?.notes?.match(/Keyword:\s*([^|]+)/);
  const keyword     = kwMatch ? kwMatch[1].trim() : slug.replace(/-/g, ' ');
  const wordMatch   = task?.notes?.match(/Target:\s*(\d+)/);
  const targetWords = wordMatch ? parseInt(wordMatch[1]) : 2000;

  // ── Write pipeline context (seed file) ──────────────────────────────────────
  const contextPath = path.join(CONTENT_OUT, `pipeline-context-${TASK_ID || slug}.json`);
  const contextData = {
    task_id:           TASK_ID,
    sprint_id:         SPRINT_ID,
    slug,
    title:             task?.title || slug,
    primary_keyword:   keyword,
    author:            task?.authorOwner || 'Unknown',
    target_word_count: targetWords,
    priority:          task?.priority || 'P2',
    notes:             task?.notes || '',
    from_step:         FROM_STEP || null,
  };

  if (!DRY_RUN) {
    fs.mkdirSync(path.dirname(contextPath), { recursive: true });
    fs.writeFileSync(contextPath, JSON.stringify(contextData, null, 2) + '\n', 'utf8');
    console.log(`✅ pipeline-context-${TASK_ID || slug}.json written`);
  } else {
    console.log(`[DRY] Would write: pipeline-context-${TASK_ID || slug}.json`);
    console.log('[DRY] Would call: openclaw agent --agent content-pipeline');
    return;
  }

  // ── Launch agent ─────────────────────────────────────────────────────────────
  clearSession('content-pipeline');
  console.log('\n🤖 Launching content-pipeline agent (all steps run inside agent)...\n');

  const fromMsg = FROM_STEP ? ` Resume from step: ${FROM_STEP}.` : '';
  execFileSync('openclaw', [
    'agent', '--agent', 'content-pipeline',
    '--message',
    `Run the full content pipeline for sprint ${SPRINT_ID}, task_id ${TASK_ID || slug}, slug ${slug}.${fromMsg} ` +
    `Context file: seo-automation/outputs/content-pipeline/pipeline-context-${TASK_ID || slug}.json. ` +
    'Read seo-automation/content-pipeline/orchestrator.md and execute ALL steps: ' +
    'Content Strategist → Content Writer → Word Count Gate → Content Editor → ' +
    'Graphics Designer → HTML Preview → Write pipeline-result → ' +
    'Write content-approval JSON → Send Telegram approval request with buttons. ' +
    'Do not stop early.',
  ], { stdio: 'inherit', timeout: 900000 });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ Content pipeline agent completed.');
  console.log('   Waiting for Telegram APPROVE / REVISE / REJECT.');
  console.log('   Ensure content-approval-bridge.js is running.');
  console.log('═══════════════════════════════════════════════════════\n');
}

main();
