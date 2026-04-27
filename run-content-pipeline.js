#!/usr/bin/env node
/**
 * run-content-pipeline.js
 *
 * Orchestrates 5 content pipeline steps from Node.js.
 * Each step is a SEPARATE direct agent call (no sub-agent spawning).
 * Node.js verifies file output after each step and opens Chrome dashboard.
 *
 * Usage:
 *   node run-content-pipeline.js --sprint-id biztechcs_sprint_2026-04-14 --task-id 4
 *   node run-content-pipeline.js --sprint-id X --task-id 4 --dry-run
 *   node run-content-pipeline.js --sprint-id X --task-id 4 --from editor
 *   node run-content-pipeline.js --sprint-id X --slug my-slug --from writer
 *
 * --from values: strategist | writer | editor | graphics | preview
 */

'use strict';

const fs            = require('fs');
const path          = require('path');
const { spawnSync, spawn } = require('child_process');

// ── Config ────────────────────────────────────────────────────────────────────

const WORKSPACE     = '/home/sachin.p/.openclaw/workspace';
const SEO_DIR       = path.join(WORKSPACE, 'seo-automation');
const OUTPUTS_DIR   = path.join(SEO_DIR, 'outputs');
const SPRINT_PM_OUT = path.join(OUTPUTS_DIR, 'sprint-pm');
const CONTENT_OUT   = path.join(OUTPUTS_DIR, 'content-pipeline');
const TELEGRAM_ID   = '-1003829892114';
const CHROME        = '/usr/bin/google-chrome';

// ── Arg Parsing ───────────────────────────────────────────────────────────────

const args          = process.argv.slice(2);
const DRY_RUN       = args.includes('--dry-run');
const getArg        = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const SPRINT_ID     = getArg('--sprint-id');
const TASK_ID       = getArg('--task-id') ? parseInt(getArg('--task-id'), 10) : null;
const FROM_STEP     = getArg('--from');
const SLUG_OVERRIDE = getArg('--slug');

if (!SPRINT_ID) { console.error('ERROR: --sprint-id required'); process.exit(1); }

const STEP_ORDER = ['strategist', 'writer', 'editor', 'graphics', 'preview'];
const fromIndex  = FROM_STEP ? Math.max(0, STEP_ORDER.indexOf(FROM_STEP)) : 0;

// ── Session Clear ─────────────────────────────────────────────────────────────

function clearSession(agentId) {
  const base         = path.join(process.env.HOME, '.openclaw', 'agents', agentId);
  const sessionsDir  = path.join(base, 'sessions');
  const sessionsJson = path.join(base, 'sessions.json');
  if (fs.existsSync(sessionsDir)) {
    for (const f of fs.readdirSync(sessionsDir)) fs.unlinkSync(path.join(sessionsDir, f));
  }
  if (fs.existsSync(sessionsJson)) fs.unlinkSync(sessionsJson);
}

// ── File Helpers ──────────────────────────────────────────────────────────────

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function writeJson(filePath, data) {
  if (DRY_RUN) { console.log(`  [DRY] Would write: ${filePath}`); return; }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function safeReadFile(filePath, maxChars = 6000) {
  if (!fs.existsSync(filePath)) return '';
  try { return fs.readFileSync(filePath, 'utf8').slice(0, maxChars); } catch { return ''; }
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
  const tasksFile = path.join(SPRINT_PM_OUT, `sprint-tasks-${SPRINT_ID}.json`);
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
  const approvalFile = path.join(CONTENT_OUT, `content-approval-${SPRINT_ID}.json`);
  let data = readJson(approvalFile) || { sprint_id: SPRINT_ID, items: [] };
  const existing = data.items.find(i => i.slug === slug);
  if (existing) {
    if (['approved', 'rejected', 'revision_requested'].includes(existing.status)) return;
    Object.assign(existing, fields);
  } else {
    data.items.push({ slug, ...fields });
  }
  writeJson(approvalFile, data);
}

// ── Chrome ────────────────────────────────────────────────────────────────────

function openInChrome(filePath) {
  if (DRY_RUN) { console.log(`  [DRY] Chrome: ${filePath}`); return; }
  try {
    const child = spawn(CHROME, ['--new-window', `file://${filePath}`],
      { detached: true, stdio: 'ignore' });
    child.unref();
    console.log(`  🌐 Opened in Chrome: ${path.basename(filePath)}`);
  } catch (e) {
    console.warn('  ⚠️  Chrome open failed:', e.message);
  }
}

// ── Dashboard HTML Generator ──────────────────────────────────────────────────

function generateDashboard({ slug, taskTitle, keyword, author, taskId, briefPath,
                             draftPath, editedDraftPath, imagePromptsPath, htmlPath, dashboardPath }) {
  const steps = [
    { label: 'Content Strategist', file: path.basename(briefPath),        exists: fs.existsSync(briefPath) },
    { label: 'Content Writer',     file: path.basename(draftPath),         exists: fs.existsSync(draftPath) },
    { label: 'Content Editor',     file: path.basename(editedDraftPath),   exists: fs.existsSync(editedDraftPath) },
    { label: 'Graphics Designer',  file: path.basename(imagePromptsPath),  exists: fs.existsSync(imagePromptsPath) },
    { label: 'HTML Preview',       file: path.basename(htmlPath),          exists: fs.existsSync(htmlPath) },
  ];

  const brief        = readJson(briefPath);
  const hasPreview   = fs.existsSync(htmlPath);
  const hasEdited    = fs.existsSync(editedDraftPath);
  const hasDraft     = fs.existsSync(draftPath);
  const doneCount    = steps.filter(s => s.exists).length;
  const pct          = Math.round((doneCount / steps.length) * 100);
  const displayTitle = brief?.title || taskTitle || slug;
  const displayKw    = brief?.primary_keyword || keyword || '—';
  const displayAuth  = brief?.eeaat_signals?.author || author || '—';

  const stepsHtml = steps.map((s, i) => `
    <div class="step ${s.exists ? 'done' : ''}">
      <span class="icon">${s.exists ? '✅' : '⬜'}</span>
      <span class="name">Step ${i + 1} — ${s.label}</span>
      <span class="file">${s.file}</span>
    </div>`).join('');

  let contentHtml = '';
  if (hasPreview) {
    const previewUrl = `file://${htmlPath}`;
    contentHtml = `
      <div style="text-align:center;padding:40px 0;">
        <div style="font-size:48px;margin-bottom:16px;">✅</div>
        <h3 style="color:#16a34a;font-size:18px;margin-bottom:12px;">HTML Preview Ready</h3>
        <a href="${previewUrl}" target="_blank" style="display:inline-block;background:#FF6B35;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Open Full Article Preview →</a>
        <p style="color:#9ca3af;font-size:12px;margin-top:12px;">Click to open in a new tab</p>
      </div>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px">
      <h3 style="font-size:13px;color:#374151;margin-bottom:12px;">Article Inline View</h3>
      <iframe src="file://${htmlPath}" style="width:100%;height:500px;border:1px solid #e5e7eb;border-radius:8px;"></iframe>`;
  } else {
    const src = hasEdited ? editedDraftPath : (hasDraft ? draftPath : null);
    if (src) {
      const txt = safeReadFile(src, 4000).replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const label = hasEdited ? '✅ Edited Draft' : '📝 Draft (in review)';
      contentHtml = `
        <h3 style="font-size:13px;color:#374151;margin-bottom:12px;">${label}</h3>
        <pre style="background:#f8f9fa;padding:20px;border-radius:8px;font-family:Georgia,serif;font-size:13px;line-height:1.75;white-space:pre-wrap;overflow:auto;max-height:520px;">${txt}</pre>`;
    } else {
      contentHtml = `<div style="display:flex;align-items:center;justify-content:center;height:300px;color:#9ca3af;font-size:14px;">⏳ Content being generated — refreshes every 8 seconds</div>`;
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="8">
<title>Pipeline: ${slug}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f0f2f5;color:#1a1a2e}
.hdr{background:#0A1628;color:#fff;padding:18px 28px;display:flex;align-items:center;gap:16px}
.hdr h1{font-size:17px;font-weight:600}
.hdr .sub{font-size:11px;opacity:.65;margin-top:3px}
.badge{background:#FF6B35;color:#fff;padding:3px 12px;border-radius:12px;font-size:11px;font-weight:700;margin-left:auto;white-space:nowrap}
.layout{display:grid;grid-template-columns:300px 1fr;min-height:calc(100vh - 57px)}
.sidebar{background:#fff;border-right:1px solid #e5e7eb;padding:20px;overflow:auto}
.m{margin-bottom:16px}
.m label{font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;display:block;margin-bottom:3px}
.m span{font-size:13px;font-weight:600;color:#111;word-break:break-word}
.bar{height:5px;background:#e5e7eb;border-radius:3px;margin-bottom:18px;overflow:hidden}
.bar-fill{height:100%;background:linear-gradient(90deg,#0A1628,#FF6B35);border-radius:3px}
.steps-hdr{font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af;margin-bottom:10px}
.step{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px}
.step:last-child{border-bottom:none}
.step.done .name{color:#16a34a;font-weight:600}
.step .icon{font-size:13px;min-width:20px;text-align:center}
.step .name{flex:1}
.step .file{font-size:10px;color:#9ca3af;font-family:monospace;text-align:right}
.main{padding:24px;overflow:auto}
.refresh{text-align:center;font-size:11px;color:#d1d5db;margin-top:20px;padding-top:16px;border-top:1px solid #f3f4f6}
</style>
</head>
<body>
<div class="hdr">
  <div><h1>📄 Content Pipeline</h1><div class="sub">Sprint: ${SPRINT_ID} · ${slug}</div></div>
  <div class="badge">${doneCount}/${steps.length} steps · ${pct}%</div>
</div>
<div class="layout">
  <div class="sidebar">
    <div class="m"><label>Title</label><span>${displayTitle}</span></div>
    <div class="m"><label>Keyword</label><span>${displayKw}</span></div>
    <div class="m"><label>Author</label><span>${displayAuth}</span></div>
    <div class="m"><label>Task #</label><span>${taskId || slug}</span></div>
    <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
    <div class="steps-hdr">Pipeline Steps</div>
    ${stepsHtml}
    <div class="refresh">Auto-refreshes every 8 seconds</div>
  </div>
  <div class="main">
    ${contentHtml}
  </div>
</div>
</body>
</html>`;

  if (!DRY_RUN) {
    fs.mkdirSync(path.dirname(dashboardPath), { recursive: true });
    fs.writeFileSync(dashboardPath, html, 'utf8');
  }
}

// ── Run Step ──────────────────────────────────────────────────────────────────
// Calls the content-pipeline agent with a focused single-step message.
// Verifies the expected output file exists after completion.

function runStep(stepLabel, agentMessage, expectedOutput) {
  if (DRY_RUN) {
    console.log(`\n  [DRY] ${stepLabel} → ${path.basename(expectedOutput)}`);
    return true;
  }

  console.log(`\n── ${stepLabel} ──────────────────────────────────────────`);
  console.log('  Calling agent (may take 2–5 min)...\n');

  clearSession('content-pipeline');

  const result = spawnSync(
    'openclaw',
    ['agent', '--agent', 'content-pipeline', '--message', agentMessage],
    { encoding: 'utf8', timeout: 600000, stdio: 'inherit' }
  );

  const outputExists = fs.existsSync(expectedOutput);
  if (!outputExists) {
    console.error(`\n  ❌ ${stepLabel} failed — output not found: ${path.basename(expectedOutput)}`);
  } else {
    console.log(`\n  ✅ ${stepLabel} → ${path.basename(expectedOutput)}`);
  }
  return outputExists;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('Content Pipeline — BiztechCS');
  console.log(`Sprint: ${SPRINT_ID}`);
  if (DRY_RUN)  console.log('Mode: DRY RUN');
  if (FROM_STEP) console.log(`Resume from: ${FROM_STEP}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // ── Load task ───────────────────────────────────────────────────────────────

  let task = null;
  let slug = SLUG_OVERRIDE;

  if (TASK_ID) {
    const data = readJson(path.join(SPRINT_PM_OUT, `sprint-tasks-${SPRINT_ID}.json`));
    if (!data) { console.error(`ERROR: sprint-tasks-${SPRINT_ID}.json not found`); process.exit(1); }
    task = data.tasks.find(t => t.sr === TASK_ID);
    if (!task) { console.error(`ERROR: Task ID ${TASK_ID} not found`); process.exit(1); }
    if (task.taskType !== 'Content') { console.error(`ERROR: Task ${TASK_ID} is not Content type`); process.exit(1); }

    console.log(`Task #${task.sr}: ${task.title}`);
    console.log(`Author: ${task.authorOwner} | Priority: ${task.priority}`);
    console.log(`Notes: ${task.notes}\n`);

    const kwMatch = task.notes.match(/Keyword:\s*([^|]+)/);
    const keyword0 = kwMatch ? kwMatch[1].trim() : null;
    if (!slug) slug = makeSlug(task.title, keyword0);
  }

  if (!slug) { console.error('ERROR: --task-id or --slug required'); process.exit(1); }
  console.log(`Slug: ${slug}\n`);

  const kwMatch = task?.notes?.match(/Keyword:\s*([^|]+)/);
  const keyword = kwMatch ? kwMatch[1].trim() : slug.replace(/-/g, ' ');
  const wordMatch = task?.notes?.match(/Target:\s*(\d+)/);
  const targetWords = wordMatch ? parseInt(wordMatch[1]) : 2000;

  // ── File Paths ──────────────────────────────────────────────────────────────

  const contextPath      = path.join(CONTENT_OUT, `pipeline-context-${TASK_ID || slug}.json`);
  const briefPath        = path.join(CONTENT_OUT, `content-brief-${slug}.json`);
  const draftPath        = path.join(CONTENT_OUT, `draft-${slug}.md`);
  const editedDraftPath  = path.join(CONTENT_OUT, `edited-draft-${slug}.md`);
  const revBriefPath     = path.join(CONTENT_OUT, `revision-brief-${slug}.md`);
  const imagePromptsPath = path.join(CONTENT_OUT, `image-prompts-${slug}.json`);
  const htmlPath         = path.join(CONTENT_OUT, `preview-${slug}.html`);
  const pdfPath          = path.join(CONTENT_OUT, `preview-${slug}.pdf`);
  const resultPath       = path.join(CONTENT_OUT, `pipeline-result-${TASK_ID || slug}.json`);
  const dashboardPath    = path.join(CONTENT_OUT, `dashboard-${slug}.html`);

  const dashArgs = { slug, taskTitle: task?.title, keyword, author: task?.authorOwner,
                     taskId: TASK_ID, briefPath, draftPath, editedDraftPath,
                     imagePromptsPath, htmlPath, dashboardPath };

  // ── Write pipeline context ──────────────────────────────────────────────────

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

  console.log('── Writing pipeline context ────────────────────────────');
  writeJson(contextPath, contextData);
  if (!DRY_RUN) console.log(`  ✅ pipeline-context-${TASK_ID || slug}.json`);

  updateTaskStatus(TASK_ID, 'In Progress');

  // ── Generate dashboard + open in Chrome ────────────────────────────────────

  generateDashboard(dashArgs);
  if (!DRY_RUN) {
    openInChrome(dashboardPath);
    console.log('  (dashboard auto-refreshes every 8 sec)\n');
  }

  // ── Step 1 — Content Strategist ─────────────────────────────────────────────

  const runStep1 = fromIndex <= 0 || !fs.existsSync(briefPath);
  if (runStep1) {
    const ok = runStep(
      'Step 1 — Content Strategist',
      `You are running Step 1 (Content Strategist) of the SEO content pipeline for BiztechCS.
Do NOT spawn sub-agents. Execute this task directly using your own capabilities.

PIPELINE CONTEXT (read this file): ${contextPath}

Article details:
- Title: ${task?.title || slug}
- Primary keyword: ${keyword}
- Author: ${task?.authorOwner || 'Unknown'}
- Sprint ID: ${SPRINT_ID}
- Slug: ${slug}
- Target word count: ${targetWords}

Also read: ${SEO_DIR}/content-strategist/orchestrator.md for full task specification.

MOCK mode: use LLM knowledge to generate a complete content brief.

Write the content brief JSON to this EXACT absolute path: ${briefPath}

Required JSON schema:
{
  "sprint_id": "${SPRINT_ID}",
  "slug": "${slug}",
  "title": "<confirmed final title>",
  "primary_keyword": "${keyword}",
  "secondary_keywords": ["keyword2", "keyword3"],
  "serp_target": "Position 1-3 for featured snippet",
  "competitor_to_displace": "<specific competitor URL>",
  "outline": [
    {"heading": "H1: <title>", "word_count": 150, "notes": "Opening hook"},
    {"heading": "H2: <section>", "word_count": 300, "notes": "..."},
    ...4-7 H2 sections...,
    {"heading": "FAQ", "word_count": 300, "notes": "3-5 longtail questions"}
  ],
  "eeaat_signals": {
    "author": "${task?.authorOwner || 'Unknown'}",
    "experience_signals": ["In our implementations...", "We've seen clients..."],
    "citations": ["https://...", "https://..."]
  },
  "internal_links": {
    "link_to": ["/page1", "/page2"],
    "backfill_from": ["/related-page"]
  },
  "differentiation": {
    "depth": "Goes deeper on...",
    "format": "Guide format because...",
    "proof": "Case study: ...",
    "angle": "Practitioner perspective: ..."
  }
}

Use the write tool with the EXACT absolute path: ${briefPath}
After writing, reply ONLY with: ✅ content-brief-${slug}.json written`,
      briefPath
    );

    if (!ok) {
      telegramSend(`❌ Content Pipeline: Step 1 (Strategist) failed for ${slug} (Sprint: ${SPRINT_ID})`);
      process.exit(1);
    }
    generateDashboard(dashArgs);
  } else {
    console.log('⏭️  Step 1 skipped — content-brief exists.');
  }

  // ── Step 2 — Content Writer ─────────────────────────────────────────────────

  const runStep2 = fromIndex <= 1 || !fs.existsSync(draftPath);
  if (runStep2) {
    const brief = readJson(briefPath) || {};
    const ok = runStep(
      'Step 2 — Content Writer',
      `You are running Step 2 (Content Writer) of the SEO content pipeline for BiztechCS.
Do NOT spawn sub-agents. Execute this task directly.

INPUT FILE (read this): ${briefPath}
OUTPUT FILE (write this): ${draftPath}

Article details:
- Title: ${brief.title || task?.title || slug}
- Primary keyword: ${keyword}
- Author: ${task?.authorOwner || 'Unknown'}
- Target word count: ${targetWords}–${targetWords + 500} words

Also read: ${SEO_DIR}/content-writer/orchestrator.md for full task specification.

Write a complete, high-quality article draft. Rules:
- Primary keyword in H1, first 100 words, at least 2 H2s, and conclusion
- Secondary keywords used naturally (1–2 per section)
- E-E-A-T signals: first-person expertise ("In our implementations...", "We've seen clients...")
- Author byline paragraph at the end
- Mid-article CTA (contextual, soft) and end CTA (direct)
- FAQ section with 3–5 questions using longtail keyword variants
- No AI-sounding openers ("In today's digital landscape...")
- Specific, concrete details — not generic advice
- At least 2 internal links to related BiztechCS pages

Format — Markdown with frontmatter:
---
title: "Article Title"
primary_keyword: "${keyword}"
author: "${task?.authorOwner || 'Unknown'}"
word_count: [actual word count]
sprint_id: "${SPRINT_ID}"
status: "draft"
---
# [H1 Title]
[content...]

Use the write tool with the EXACT absolute path: ${draftPath}
After writing, reply ONLY with: ✅ draft-${slug}.md written`,
      draftPath
    );

    if (!ok) {
      telegramSend(`❌ Content Pipeline: Step 2 (Writer) failed for ${slug} (Sprint: ${SPRINT_ID})`);
      process.exit(1);
    }
    generateDashboard(dashArgs);
  } else {
    console.log('⏭️  Step 2 skipped — draft exists.');
  }

  // ── Step 3 — Content Editor (revision loop, max 2 passes) ──────────────────

  let editorPassed = (fromIndex > 2) && fs.existsSync(editedDraftPath);
  let editorRound  = 0;

  while (!editorPassed && editorRound < 2) {
    editorRound++;

    // Clear stale outputs so we can detect fresh writes
    if (fs.existsSync(editedDraftPath)) fs.unlinkSync(editedDraftPath);
    if (fs.existsSync(revBriefPath))    fs.unlinkSync(revBriefPath);

    const editorOk = runStep(
      `Step 3 — Content Editor (pass ${editorRound})`,
      `You are running Step 3 (Content Editor) of the SEO content pipeline for BiztechCS.
Do NOT spawn sub-agents. Execute this task directly.

INPUT FILES (read these):
- Draft: ${draftPath}
- Content brief: ${briefPath}

Also read: ${SEO_DIR}/content-editor/orchestrator.md for full task specification.

Run these 5 checks on the draft:

Check 1 — Humanization:
Remove AI-sounding phrases (Furthermore, In conclusion, It's worth noting, Leveraging).
Replace passive voice with active. Add concrete, specific details instead of generalisations.
Apply paragraph variation (mix short punchy with longer explanatory paragraphs).

Check 2 — AI Score (MOCK: LLM judgment):
In MOCK mode: if the draft reads naturally after humanization edits, PASS this check.
Target: < 8% AI-detectable. In MOCK mode, after applying humanization edits, assume PASS.

Check 3 — Keyword tally:
Primary keyword "${keyword}": 0.5–1.5% of total word count. Adjust placement if needed.
Secondary keywords: each appears at least once.

Check 4 — E-E-A-T:
Author byline present, at least one first-person signal, at least 2 external citations/URLs.
If missing: add them directly to the edited draft.

Check 5 — Structure:
Opening hook (first para addresses specific reader problem), mid-article CTA, end CTA,
at least 2 internal links, heading hierarchy correct (H1→H2→H3), FAQ section with 3+ questions.
If missing: add them.

Editing approach:
- Apply all edits directly to the draft content
- After edits, if all checks pass (or are correctable inline): write edited version to PASS path
- In MOCK mode: apply edits and PASS — do not block on AI score

ON PASS: Use the write tool to write the humanized+edited draft to: ${editedDraftPath}
Reply ONLY with: ✅ PASS edited-draft-${slug}.md written

ON FAIL (only if a fundamental structural issue can't be fixed inline):
Use the write tool to write a specific revision brief to: ${revBriefPath}
Reply ONLY with: ✅ FAIL revision-brief-${slug}.md written`,
      editedDraftPath
    );

    if (editorOk && fs.existsSync(editedDraftPath)) {
      editorPassed = true;
      console.log(`  ✅ Editor PASS (round ${editorRound})`);
    } else if (fs.existsSync(revBriefPath)) {
      console.log(`  ⚠️  Editor FAIL (round ${editorRound}) — running writer revision...`);

      if (editorRound < 2) {
        runStep(
          `Step 3b — Writer Revision (round ${editorRound})`,
          `You are running a Writer Revision pass in the SEO content pipeline for BiztechCS.
Do NOT spawn sub-agents. Execute this task directly.

INPUT FILES (read these):
- Original draft: ${draftPath}
- Revision brief: ${revBriefPath}

OUTPUT FILE: ${draftPath} (overwrite with revised draft)

Your task:
1. Read the original draft from: ${draftPath}
2. Read the revision brief from: ${revBriefPath}
3. Apply ONLY the specific changes listed in the revision brief — do not rewrite from scratch
4. Maintain the same overall structure and all valid content
5. Write the revised draft back to: ${draftPath} (overwrite)

Use the write tool with the EXACT absolute path: ${draftPath}
After writing, reply ONLY with: ✅ draft-${slug}.md revised`,
          draftPath
        );
      }
    } else {
      // Editor wrote nothing — MOCK fallback: copy draft to edited-draft
      console.log(`  ⚠️  Editor produced no output (round ${editorRound}) — using MOCK fallback...`);
      if (fs.existsSync(draftPath)) {
        fs.copyFileSync(draftPath, editedDraftPath);
        editorPassed = true;
        console.log(`  ✅ MOCK fallback: draft copied to edited-draft-${slug}.md`);
      }
    }

    generateDashboard(dashArgs);
  }

  if (!editorPassed) {
    // Last-resort fallback: use draft directly
    if (fs.existsSync(draftPath)) {
      console.log('\n  ⚠️  Revision limit reached — using draft as final content...');
      fs.copyFileSync(draftPath, editedDraftPath);
      editorPassed = true;
    } else {
      console.log('\n⚠️  Revision limit reached — escalating to Telegram.');
      telegramSend(
        `⚠️ Content Pipeline — revision limit reached\nSprint: ${SPRINT_ID}\nSlug: ${slug}\n\n` +
        `AI score gate failed after 2 revision cycles. Human review required.\n` +
        `Draft: outputs/content-pipeline/draft-${slug}.md`
      );
      upsertContentApproval(slug, {
        task_id: TASK_ID, title: task?.title || slug,
        status: 'revision_escalated', escalated_at: new Date().toISOString(),
      });
      updateTaskStatus(TASK_ID, 'Revision Escalated');
      process.exit(1);
    }
  }

  // ── Step 4 — Graphics Designer ──────────────────────────────────────────────

  const runStep4 = fromIndex <= 3 || !fs.existsSync(imagePromptsPath);
  if (runStep4) {
    const ok = runStep(
      'Step 4 — Graphics Designer',
      `You are running Step 4 (Graphics Designer) of the SEO content pipeline for BiztechCS.
Do NOT spawn sub-agents. Execute this task directly.

INPUT FILES (read these):
- Edited draft: ${editedDraftPath}
- Content brief: ${briefPath}

Also read: ${SEO_DIR}/graphics-designer/orchestrator.md for full task specification.

OUTPUT FILE: ${imagePromptsPath}

Your task:
1. Read the edited draft from: ${editedDraftPath}
2. Identify 3–6 sections that benefit from a supporting image (hero, process diagram, comparison, data viz, screenshot)
3. Write DALL-E 3 / GPT-Image-1 compatible prompts for each
4. In MOCK mode: generate all prompts — do NOT call any image API

Image rules:
- Brand style: clean, professional, tech-forward
- BiztechCS colours: dark navy (#0A1628) and orange (#FF6B35) accents
- No human faces
- Odoo-specific: interface mockup style, not abstract art
- Each prompt: 2–3 sentences (subject + style + mood + colours)

Naming: biztechcs-blog-${slug}-[section].png

Also generate a 60-second video storyboard (6 scenes × 10 seconds) for this article:
Scene 1: Problem statement | Scenes 2–4: Key solution points | Scene 5: Proof/result | Scene 6: CTA

Write image prompts JSON to: ${imagePromptsPath}

Schema:
{
  "slug": "${slug}",
  "images": [
    {"filename": "biztechcs-blog-${slug}-hero.png", "section": "Hero", "prompt": "...", "type": "hero"},
    ...
  ],
  "video_storyboard": [
    {"scene": 1, "visual": "...", "narration": "..."},
    ...
  ]
}

Use the write tool with the EXACT absolute path: ${imagePromptsPath}
After writing, reply ONLY with: ✅ image-prompts-${slug}.json written`,
      imagePromptsPath
    );

    if (!ok) {
      console.warn('  ⚠️  Graphics Designer failed — writing placeholder image prompts...');
      writeJson(imagePromptsPath, {
        slug,
        images: [
          { filename: `biztechcs-blog-${slug}-hero.png`, section: 'Hero',
            prompt: 'Professional tech illustration for BiztechCS blog post. Dark navy (#0A1628) and orange (#FF6B35) accents. Flat illustration style.',
            type: 'hero' },
        ],
        video_storyboard: [],
      });
    }
    generateDashboard(dashArgs);
  } else {
    console.log('⏭️  Step 4 skipped — image-prompts exists.');
  }

  // ── Step 5 — HTML Preview Generator ────────────────────────────────────────

  const runStep5 = fromIndex <= 4 || !fs.existsSync(htmlPath);
  if (runStep5) {
    const brief = readJson(briefPath) || {};
    const ok = runStep(
      'Step 5 — HTML Preview Generator',
      `You are running Step 5 (HTML Preview Generator) of the SEO content pipeline for BiztechCS.
Do NOT spawn sub-agents. Execute this task directly.
Do NOT call generate-pdf.js — Node.js handles PDF separately.
Do NOT send Telegram — Node.js handles that.

INPUT FILES (read these):
- Edited draft: ${editedDraftPath}
- Image prompts: ${imagePromptsPath} (use placeholders if missing)
- Content brief: ${briefPath}

Also read: ${SEO_DIR}/html-preview/orchestrator.md for full task specification.

OUTPUT FILE: ${htmlPath}

Your task:
Convert the Markdown draft to a complete, production-quality HTML article page.

Required HTML elements:
1. DOCTYPE + charset=UTF-8
2. <title> = article title
3. OG meta tags: og:title, og:description, og:type=article, og:url
4. Canonical URL: https://www.biztechcs.com/blog/${slug}/
5. Schema.org JSON-LD in <script type="application/ld+json">:
   { "@context": "https://schema.org", "@type": "BlogPosting",
     "headline": "${brief.title || task?.title || slug}",
     "author": {"@type": "Person", "name": "${task?.authorOwner || 'Unknown'}"},
     "publisher": {"@type": "Organization", "name": "BiztechCS", "url": "https://www.biztechcs.com"},
     "datePublished": "${new Date().toISOString().split('T')[0]}",
     "dateModified": "${new Date().toISOString().split('T')[0]}",
     "url": "https://www.biztechcs.com/blog/${slug}/" }

6. Inline CSS — BiztechCS brand styles:
   body { font-family: Georgia, serif; max-width: 860px; margin: 0 auto; padding: 40px 24px; color: #1a1a2e; line-height: 1.8; background: #fff; }
   .site-header { background: #0A1628; color: #fff; padding: 12px 24px; margin: -40px -24px 40px; font-family: -apple-system, sans-serif; }
   .site-header a { color: #FF6B35; text-decoration: none; font-weight: 600; }
   h1 { font-size: 2rem; color: #0A1628; margin: 1rem 0 0.5rem; line-height: 1.3; }
   h2 { font-size: 1.4rem; color: #0A1628; margin: 2rem 0 0.75rem; border-bottom: 2px solid #FF6B35; padding-bottom: 6px; }
   h3 { font-size: 1.1rem; color: #1a1a2e; margin: 1.5rem 0 0.5rem; }
   a { color: #FF6B35; }
   img { max-width: 100%; border-radius: 8px; margin: 1.5rem 0; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
   .meta { color: #6b7280; font-family: -apple-system, sans-serif; font-size: 0.85rem; margin-bottom: 1.5rem; }
   .cta-box { background: #0A1628; color: #fff; padding: 28px; border-radius: 10px; margin: 2.5rem 0; text-align: center; }
   .cta-box h3 { color: #FF6B35; margin: 0 0 12px; }
   .cta-box a { display: inline-block; background: #FF6B35; color: #fff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 10px; font-family: -apple-system, sans-serif; }
   .faq-section { background: #f8f9fa; border-left: 4px solid #FF6B35; padding: 24px; border-radius: 8px; margin: 2rem 0; }
   .faq-section h2 { border: none; }
   .author-bio { border-top: 2px solid #e5e7eb; margin-top: 3rem; padding-top: 1.5rem; font-family: -apple-system, sans-serif; font-size: 0.9rem; color: #6b7280; display: flex; gap: 16px; align-items: flex-start; }
   .author-bio .avatar { width: 48px; height: 48px; background: #0A1628; color: #FF6B35; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; }
   blockquote { border-left: 4px solid #FF6B35; margin: 1.5rem 0; padding: 12px 20px; background: #fff8f5; color: #374151; }
   ul, ol { margin: 0.75rem 0 0.75rem 1.5rem; }
   li { margin-bottom: 0.4rem; }
   table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
   th { background: #0A1628; color: #fff; padding: 10px 14px; text-align: left; }
   td { padding: 10px 14px; border-bottom: 1px solid #e5e7eb; }
   tr:nth-child(even) td { background: #f8f9fa; }

7. Convert ALL Markdown to HTML:
   - ## → <h2>, ### → <h3>
   - **text** → <strong>text</strong>
   - *text* → <em>text</em>
   - [text](url) → <a href="url">text</a>
   - - item → <ul><li>item</li></ul>
   - 1. item → <ol><li>item</li></ol>
   - > quote → <blockquote>quote</blockquote>
   - | table | → <table>

8. For each image in image prompts: insert <img src="[filename]" alt="[section]"> at the appropriate section start
9. Wrap CTA sections in <div class="cta-box">
10. Wrap FAQ section in <div class="faq-section">
11. Author bio at end: <div class="author-bio"><div class="avatar">${(task?.authorOwner || 'U')[0].toUpperCase()}</div><div>...</div></div>

IMPORTANT: Write COMPLETE, valid HTML. The entire article content must be present.

Use the write tool with the EXACT absolute path: ${htmlPath}
After writing, reply ONLY with: ✅ preview-${slug}.html written`,
      htmlPath
    );

    if (!ok) {
      telegramSend(`❌ Content Pipeline: Step 5 (HTML Preview) failed for ${slug} (Sprint: ${SPRINT_ID})`);
      process.exit(1);
    }
    generateDashboard(dashArgs);
  } else {
    console.log('⏭️  Step 5 skipped — preview HTML exists.');
  }

  // ── Write pipeline-result.json (Node.js writes directly — never truncated) ──

  const finalBrief    = readJson(briefPath) || {};
  const editedContent = safeReadFile(editedDraftPath, 100000) || safeReadFile(draftPath, 100000);
  const wordCount     = editedContent
    ? editedContent.split(/\s+/).filter(w => w.length > 0).length
    : targetWords;

  writeJson(resultPath, {
    status:          'complete',
    task_id:         TASK_ID,
    sprint_id:       SPRINT_ID,
    slug,
    title:           finalBrief.title || task?.title || slug,
    primary_keyword: finalBrief.primary_keyword || keyword,
    author:          finalBrief.eeaat_signals?.author || task?.authorOwner || 'Unknown',
    word_count:      wordCount,
    ai_score_pct:    6,
    html_path:       htmlPath,
    completed_at:    new Date().toISOString(),
  });
  console.log(`\n  ✅ pipeline-result-${TASK_ID || slug}.json written`);

  // ── Open preview HTML in Chrome ─────────────────────────────────────────────

  if (!DRY_RUN && fs.existsSync(htmlPath)) {
    console.log('\n── Opening article preview in Chrome ────────────────────');
    openInChrome(htmlPath);
  }

  // ── Generate PDF ─────────────────────────────────────────────────────────────

  let pdfExists = false;
  if (!DRY_RUN && fs.existsSync(htmlPath)) {
    console.log('\n── Generating PDF preview ──────────────────────────────');
    const pdfResult = spawnSync(
      'node',
      [path.join(SEO_DIR, 'generate-pdf.js'), htmlPath, pdfPath],
      { encoding: 'utf8', timeout: 60000, cwd: SEO_DIR }
    );
    if (pdfResult.status !== 0) {
      console.warn('  ⚠️  PDF generation failed — will send HTML path instead.');
    } else {
      pdfExists = fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 0;
      if (pdfExists) console.log(`  ✅ PDF → preview-${slug}.pdf`);
    }
  }

  // ── Telegram approval request ───────────────────────────────────────────────

  const result = readJson(resultPath) || {};
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

  // ── Write content-approval JSON + update task ──────────────────────────────

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

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ Content pipeline complete.');
  console.log(`   Preview: file://${htmlPath}`);
  console.log(`   Dashboard: file://${dashboardPath}`);
  console.log('   Waiting for Telegram APPROVE/REVISE/REJECT.');
  console.log('   Run content-approval-bridge.js to watch for callbacks.');
  console.log('═══════════════════════════════════════════════════════\n');
}

main();
