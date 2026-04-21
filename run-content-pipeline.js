#!/usr/bin/env node
/**
 * run-content-pipeline.js
 *
 * Slim Node.js wrapper for the content-pipeline OpenClaw agent.
 *
 * Responsibilities:
 *   1. Load task details from sprint JSON
 *   2. Write pipeline-context-[task_id].json (agent reads this)
 *   3. Call ONE `openclaw agent --agent content-pipeline` (agent handles all 5 steps)
 *   4. Read pipeline-result-[task_id].json written by agent
 *   5. Send Telegram approval buttons + write content-approval JSON + update task status
 *
 * The content-pipeline agent handles: Strategist → Writer → Editor loop →
 *   Graphics → HTML Preview. Node.js handles: Telegram, approval JSON, task status.
 *
 * Usage:
 *   node run-content-pipeline.js --sprint-id biztechcs_sprint_2026-04-14 --task-id 4
 *   node run-content-pipeline.js --sprint-id X --task-id 4 --dry-run
 *   node run-content-pipeline.js --sprint-id X --task-id 4 --from editor
 *   node run-content-pipeline.js --sprint-id X --slug odoo-impl --from editor
 *
 * --from values: strategist | writer | editor | graphics | preview
 */

'use strict';

const fs            = require('fs');
const path          = require('path');
const { spawnSync } = require('child_process');

// ── Config ────────────────────────────────────────────────────────────────────

const WORKSPACE   = '/home/sachin.p/.openclaw/workspace';
const SEO_DIR     = path.join(WORKSPACE, 'seo-automation');
const OUTPUTS_DIR = path.join(SEO_DIR, 'outputs');
const TELEGRAM_ID = '-1003829892114';

// ── Arg Parsing ───────────────────────────────────────────────────────────────

const args          = process.argv.slice(2);
const DRY_RUN       = args.includes('--dry-run');
const getArg        = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const SPRINT_ID     = getArg('--sprint-id');
const TASK_ID       = getArg('--task-id') ? parseInt(getArg('--task-id'), 10) : null;
const FROM_STEP     = getArg('--from');
const SLUG_OVERRIDE = getArg('--slug');

if (!SPRINT_ID) { console.error('ERROR: --sprint-id required'); process.exit(1); }

// ── Session Clear ─────────────────────────────────────────────────────────────

function clearSession(agentId) {
  const base        = path.join(process.env.HOME, '.openclaw', 'agents', agentId);
  const sessionsDir = path.join(base, 'sessions');
  const sessionsJson = path.join(base, 'sessions.json');
  if (fs.existsSync(sessionsDir)) {
    for (const f of fs.readdirSync(sessionsDir)) fs.unlinkSync(path.join(sessionsDir, f));
  }
  if (fs.existsSync(sessionsJson)) fs.unlinkSync(sessionsJson);
}

// ── File Helpers ──────────────────────────────────────────────────────────────

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  if (DRY_RUN) { console.log(`  [DRY] Would write: ${filePath}`); return; }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// ── Slug Generator ────────────────────────────────────────────────────────────

function makeSlug(title, keyword) {
  const base = keyword || title;
  return base.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
}

// ── Telegram ──────────────────────────────────────────────────────────────────

function telegramSend(message, extra = []) {
  if (DRY_RUN) { console.log('  [DRY] Telegram:', message.slice(0, 80)); return; }
  const r = spawnSync(
    'openclaw',
    ['message', 'send', '--channel', 'telegram', '--target', TELEGRAM_ID, '--message', message, ...extra],
    { encoding: 'utf8', timeout: 30000 }
  );
  if (r.status !== 0) console.warn(`  ⚠️  Telegram warning: ${r.stderr || r.stdout || ''}`);
  else console.log('  ✅ Telegram sent.');
}

// ── Task Status ───────────────────────────────────────────────────────────────

function updateTaskStatus(taskId, status, extraFields = {}) {
  if (!taskId) return;
  const tasksFile = path.join(OUTPUTS_DIR, `sprint-tasks-${SPRINT_ID}.json`);
  const data = readJson(tasksFile);
  if (!data) return;
  const task = data.tasks.find(t => t.sr === taskId);
  if (!task) return;
  task.status = status;
  Object.assign(task, extraFields);
  if (DRY_RUN) { console.log(`  [DRY] Task ${taskId} status → ${status}`); return; }
  fs.writeFileSync(tasksFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`  📋 Task ${taskId} status → ${status}`);
}

// ── Content Approval JSON ─────────────────────────────────────────────────────

function upsertContentApproval(slug, fields) {
  const approvalFile = path.join(OUTPUTS_DIR, `content-approval-${SPRINT_ID}.json`);
  let data = readJson(approvalFile) || { sprint_id: SPRINT_ID, items: [] };
  const existing = data.items.find(i => i.slug === slug);
  if (existing) { Object.assign(existing, fields); }
  else { data.items.push({ slug, ...fields }); }
  writeJson(approvalFile, data);
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('Content Pipeline — BiztechCS');
  console.log(`Sprint: ${SPRINT_ID}`);
  if (DRY_RUN) console.log('Mode: DRY RUN');
  if (FROM_STEP) console.log(`Resume from: ${FROM_STEP}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // ── Load task ───────────────────────────────────────────────────────────────

  let task = null;
  let slug = SLUG_OVERRIDE;

  if (TASK_ID) {
    const data = readJson(path.join(OUTPUTS_DIR, `sprint-tasks-${SPRINT_ID}.json`));
    if (!data) { console.error(`ERROR: sprint-tasks-${SPRINT_ID}.json not found`); process.exit(1); }
    task = data.tasks.find(t => t.sr === TASK_ID);
    if (!task) { console.error(`ERROR: Task ID ${TASK_ID} not found`); process.exit(1); }
    if (task.taskType !== 'Content') { console.error(`ERROR: Task ${TASK_ID} is not Content type`); process.exit(1); }

    console.log(`Task #${task.sr}: ${task.title}`);
    console.log(`Author: ${task.authorOwner} | Priority: ${task.priority}`);
    console.log(`Notes: ${task.notes}\n`);

    const kwMatch = task.notes.match(/Keyword:\s*([^|]+)/);
    const keyword = kwMatch ? kwMatch[1].trim() : null;
    if (!slug) slug = makeSlug(task.title, keyword);
  }

  if (!slug) { console.error('ERROR: --task-id or --slug required'); process.exit(1); }
  console.log(`Slug: ${slug}\n`);

  // ── Step 1: Write pipeline context ─────────────────────────────────────────

  const contextPath = path.join(OUTPUTS_DIR, `pipeline-context-${TASK_ID || slug}.json`);
  const kwMatch = task?.notes?.match(/Keyword:\s*([^|]+)/);
  const keyword = kwMatch ? kwMatch[1].trim() : slug.replace(/-/g, ' ');
  const wordMatch = task?.notes?.match(/Target:\s*(\d+)/);

  const contextData = {
    task_id:          TASK_ID,
    sprint_id:        SPRINT_ID,
    slug,
    title:            task?.title || slug,
    primary_keyword:  keyword,
    author:           task?.authorOwner || 'Unknown',
    target_word_count: wordMatch ? parseInt(wordMatch[1]) : 2000,
    priority:         task?.priority || 'P2',
    notes:            task?.notes || '',
    from_step:        FROM_STEP || null,
  };

  console.log('── Writing pipeline context ────────────────────────────');
  writeJson(contextPath, contextData);
  if (!DRY_RUN) console.log(`  ✅ context → pipeline-context-${TASK_ID || slug}.json`);

  updateTaskStatus(TASK_ID, 'In Progress');

  // ── Step 2: Run content-pipeline agent ─────────────────────────────────────

  console.log('\n── Running content-pipeline agent ──────────────────────');

  const fromMsg = FROM_STEP ? ` Resume from step: ${FROM_STEP}.` : '';
  const agentMessage = `Read the file seo-automation/content-pipeline/orchestrator.md and follow ALL instructions in it exactly. Task ID: ${TASK_ID}, Sprint ID: ${SPRINT_ID}, Slug: ${slug}.${fromMsg} Do not ask questions — execute all steps sequentially.`;

  if (DRY_RUN) {
    console.log(`  [DRY] Would call: openclaw agent --agent content-pipeline --message "${agentMessage.slice(0, 60)}..."`);
    console.log('  [DRY] Agent would run: Strategist → Writer → Editor → Graphics → HTML Preview');
    console.log('  [DRY] Would write: pipeline-result.json');
  } else {
    clearSession('content-pipeline');
    console.log(`  Calling agent: content-pipeline`);
    console.log(`  This runs all 5 steps internally (may take 5-15 min)...\n`);

    const agentResult = spawnSync(
      'openclaw',
      ['agent', '--agent', 'content-pipeline', '--message', agentMessage],
      { encoding: 'utf8', timeout: 900000, stdio: 'inherit' }
    );

    if (agentResult.status !== 0) {
      const errMsg = `Content pipeline agent failed (exit ${agentResult.status})`;
      console.error(`\n❌ ${errMsg}`);
      telegramSend(
        `❌ Content Pipeline FAILED\nSprint: ${SPRINT_ID}\nSlug: ${slug}\nError: agent exited with status ${agentResult.status}`
      );
      process.exit(1);
    }
  }

  // ── Step 3: Read pipeline result ────────────────────────────────────────────

  console.log('\n── Reading pipeline result ─────────────────────────────');

  const resultPath = path.join(OUTPUTS_DIR, `pipeline-result-${TASK_ID || slug}.json`);
  const result = DRY_RUN
    ? { status: 'complete', slug, title: task?.title || slug, primary_keyword: keyword, author: task?.authorOwner || 'Unknown', word_count: contextData.target_word_count, ai_score_pct: null, html_path: path.join(OUTPUTS_DIR, `preview-${slug}.html`) }
    : readJson(resultPath);

  if (!result) {
    console.error(`ERROR: pipeline-result not found at ${resultPath}`);
    telegramSend(`❌ Content Pipeline: result file missing for ${slug} (Sprint: ${SPRINT_ID})`);
    process.exit(1);
  }

  if (result.status === 'revision_escalated') {
    console.log(`\n⚠️  Revision limit reached — escalating to Telegram.`);
    telegramSend(
      `⚠️ Content Pipeline — revision limit reached\nSprint: ${SPRINT_ID}\nSlug: ${slug}\n\n` +
      `AI score gate failed after 2 revision cycles. Human review required.\n` +
      `Draft: outputs/draft-${slug}.md`
    );
    upsertContentApproval(slug, {
      task_id: TASK_ID, title: result.title || slug,
      status: 'revision_escalated', escalated_at: new Date().toISOString(),
    });
    updateTaskStatus(TASK_ID, 'Revision Escalated');
    process.exit(1);
  }

  console.log(`  ✅ Pipeline complete`);
  console.log(`     Title: ${result.title}`);
  console.log(`     Word count: ${result.word_count} | AI score: ${result.ai_score_pct ?? 'N/A'}%`);

  // ── Step 4: Generate PDF from HTML ──────────────────────────────────────────

  const rawHtmlPath = result.html_path || `seo-automation/outputs/preview-${slug}.html`;
  const htmlPath = path.isAbsolute(rawHtmlPath)
    ? rawHtmlPath
    : path.join(WORKSPACE, rawHtmlPath);
  const pdfPath  = path.join(OUTPUTS_DIR, `preview-${slug}.pdf`);
  let pdfExists  = false;

  if (!DRY_RUN && fs.existsSync(htmlPath)) {
    console.log('\n── Generating PDF preview ──────────────────────────────');
    const pdfResult = spawnSync(
      'node',
      [path.join(SEO_DIR, 'generate-pdf.js'), htmlPath, pdfPath],
      { encoding: 'utf8', timeout: 60000, cwd: SEO_DIR }
    );
    if (pdfResult.status !== 0) {
      console.warn(`  ⚠️  PDF generation failed — will send HTML path instead.`);
    } else {
      pdfExists = fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 0;
      if (pdfExists) console.log(`  ✅ PDF → preview-${slug}.pdf`);
    }
  }

  // ── Step 5: Telegram approval request ──────────────────────────────────────

  console.log('\n── Sending Telegram approval request ───────────────────');

  const mediaPath = pdfExists ? pdfPath : (fs.existsSync(htmlPath) ? htmlPath : null);

  telegramSend(
    `📄 Content Ready for Review\n\n` +
    `Title: ${result.title}\n` +
    `Keyword: ${result.primary_keyword || keyword}\n` +
    `Author: ${result.author || task?.authorOwner || 'Unknown'}\n` +
    `Word count: ${result.word_count} | AI score: ${result.ai_score_pct ?? 'N/A'}%\n` +
    `Sprint: ${SPRINT_ID} | Slug: ${slug}\n\n` +
    `Preview attached. Please review and choose an action below.`,
    mediaPath ? ['--media', mediaPath] : []
  );

  const buttons = JSON.stringify([[
    { text: '✅ Approve', callback_data: `content_approve|${TASK_ID}` },
    { text: '🔄 Revise',  callback_data: `content_revise|${TASK_ID}`  },
    { text: '❌ Reject',  callback_data: `content_reject|${TASK_ID}`  },
  ]]);

  telegramSend(`Choose action for: "${result.title}"`, ['--buttons', buttons]);

  // ── Step 6: Write content-approval JSON + update task ──────────────────────

  upsertContentApproval(slug, {
    task_id:        TASK_ID,
    title:          result.title,
    keyword:        result.primary_keyword || keyword,
    author:         result.author || task?.authorOwner || 'Unknown',
    word_count:     result.word_count,
    ai_score_pct:   result.ai_score_pct,
    status:         'pending_review',
    sent_at:        new Date().toISOString(),
    html_path:      htmlPath,
    pdf_path:       pdfExists ? pdfPath : null,
    approved_at:    null,
    approved_by:    null,
    revision_notes: null,
  });

  updateTaskStatus(TASK_ID, 'Pending Review');

  console.log('\n─────────────────────────────────────────────────────');
  console.log(`Content pipeline complete. Waiting for Telegram APPROVE.`);
  console.log(`Run content-approval-bridge.js to watch for callbacks.`);
  console.log('─────────────────────────────────────────────────────\n');
}

main();
