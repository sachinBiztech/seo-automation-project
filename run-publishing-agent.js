#!/usr/bin/env node
/**
 * run-publishing-agent.js
 *
 * Triggered by content-approval-bridge.js after Telegram APPROVE.
 * MOCK mode: all steps handled directly in Node.js — no agent call needed.
 * PRODUCTION mode: would call CMS REST API to publish HTML exactly as reviewed.
 *
 * Per Parth concept: "reads HTML from Drive, publishes exactly as reviewed"
 *
 * Usage:
 *   node run-publishing-agent.js --sprint-id biztechcs_sprint_2026-04-27 --slug odoo-impl-india
 *   node run-publishing-agent.js --sprint-id X --slug Y --dry-run
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync, spawn } = require('child_process');

// ── Config ────────────────────────────────────────────────────────────────────

const WORKSPACE      = '/home/sachin.p/.openclaw/workspace';
const SEO_DIR        = path.join(WORKSPACE, 'seo-automation');
const OUTPUTS        = path.join(SEO_DIR, 'outputs');
const CONTENT_OUT    = path.join(OUTPUTS, 'content-pipeline');
const PUBLISH_OUT    = path.join(OUTPUTS, 'publishing-agent');
const SPRINT_PM_OUT  = path.join(OUTPUTS, 'sprint-pm');
const TELEGRAM_ID    = '-1003829892114';
const BASE_URL       = 'https://www.biztechcs.com/blog';

// ── Arg Parsing ───────────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const getArg    = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const SPRINT_ID = getArg('--sprint-id');
const SLUG      = getArg('--slug');
const DRY_RUN   = args.includes('--dry-run');

if (!SPRINT_ID || !SLUG) {
  console.error('ERROR: --sprint-id and --slug are required');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function writeJson(filePath, data) {
  if (DRY_RUN) { console.log(`  [DRY] Would write: ${path.basename(filePath)}`); return; }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`  ✅ ${path.basename(filePath)}`);
}

function telegramSend(message) {
  if (DRY_RUN) { console.log(`  [DRY] Telegram: ${message.slice(0, 80)}`); return; }
  const r = spawnSync(
    'openclaw',
    ['message', 'send', '--channel', 'telegram', '--target', TELEGRAM_ID, '--message', message],
    { encoding: 'utf8', timeout: 30000 }
  );
  if (r.status !== 0) console.warn(`  ⚠️  Telegram warning: ${r.stderr || r.stdout || ''}`);
  else console.log('  ✅ Telegram sent.');
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Publishing Agent — BiztechCS`);
  console.log(`Sprint: ${SPRINT_ID} | Slug: ${SLUG}`);
  if (DRY_RUN) console.log('Mode: DRY RUN');
  console.log('═══════════════════════════════════════════════════════\n');

  // ── Step 1 — Verify approval ──────────────────────────────────────────────

  console.log('── Step 1 — Verify Approval ────────────────────────────');
  const approvalFile = path.join(CONTENT_OUT, `content-approval-${SPRINT_ID}.json`);
  const approval     = readJson(approvalFile);
  if (!approval) {
    console.error(`ERROR: content-approval-${SPRINT_ID}.json not found`);
    process.exit(1);
  }

  const item = approval.items?.find(i => i.slug === SLUG);
  if (!item) {
    console.error(`ERROR: slug "${SLUG}" not found in approval file`);
    process.exit(1);
  }
  if (item.status !== 'approved') {
    console.error(`ERROR: slug "${SLUG}" status is "${item.status}" — not approved`);
    process.exit(1);
  }

  console.log(`  ✅ Approval confirmed — approved at ${item.approved_at}`);
  console.log(`  Title: ${item.title}`);
  console.log(`  Author: ${item.author} | Words: ${item.word_count}`);

  // ── Step 2 — Read content-brief for full metadata ─────────────────────────

  console.log('\n── Step 2 — Load Metadata ──────────────────────────────');
  const briefPath  = path.join(CONTENT_OUT, `content-brief-${SLUG}.json`);
  const brief      = readJson(briefPath) || {};
  const htmlPath   = item.html_path || path.join(CONTENT_OUT, `preview-${SLUG}.html`);
  const title      = brief.title || item.title;
  const keyword    = brief.primary_keyword || item.keyword;
  const author     = brief.eeaat_signals?.author || item.author;
  const publishUrl = `${BASE_URL}/${SLUG}/`;

  if (!fs.existsSync(htmlPath)) {
    console.error(`ERROR: HTML preview not found at ${htmlPath}`);
    process.exit(1);
  }
  console.log(`  ✅ HTML verified: preview-${SLUG}.html`);

  // ── Step 3 — Publish to CMS (MOCK) ───────────────────────────────────────

  console.log('\n── Step 3 — Publish to CMS (MOCK) ─────────────────────');
  const publishedAt  = new Date().toISOString();
  const publishLog   = {
    sprint_id:      SPRINT_ID,
    slug:           SLUG,
    title,
    keyword,
    author,
    word_count:     item.word_count,
    published_url:  publishUrl,
    published_at:   publishedAt,
    published_mock: true,
    cms:            'BiztechCS WordPress (MOCK)',
    status:         'published',
    html_source:    htmlPath,
  };

  const publishLogPath = path.join(PUBLISH_OUT, `publish-log-${SPRINT_ID}.json`);
  writeJson(publishLogPath, publishLog);

  // ── Step 4 — Archive HTML to approved/ ────────────────────────────────────

  console.log('\n── Step 4 — Archive HTML ───────────────────────────────');
  const archivedDir  = path.join(PUBLISH_OUT, 'approved');
  const archivedPath = path.join(archivedDir, `preview-${SLUG}.html`);

  if (!DRY_RUN) {
    fs.mkdirSync(archivedDir, { recursive: true });
    fs.copyFileSync(htmlPath, archivedPath);
    console.log(`  ✅ Archived → publishing-agent/approved/preview-${SLUG}.html`);
  } else {
    console.log(`  [DRY] Would archive to: approved/preview-${SLUG}.html`);
  }

  // ── Step 5 — Update sprint tasks ──────────────────────────────────────────

  console.log('\n── Step 5 — Update Sprint Tasks ────────────────────────');
  const tasksFile = path.join(SPRINT_PM_OUT, `sprint-tasks-${SPRINT_ID}.json`);
  const tasksData = readJson(tasksFile);

  if (tasksData) {
    // Support both task structures: {tasks:[{sr,taskType,...}]} and {items:[{slug,...}]}
    const taskArr = tasksData.tasks || tasksData.items || [];
    const task    = taskArr.find(t =>
      t.slug === SLUG || t.sr === item.task_id || t.task_id === item.task_id
    );

    if (task) {
      task.status    = 'Done';
      task.completed = publishedAt.split('T')[0];
      task.drive_link = publishUrl;
      if (!DRY_RUN) {
        fs.writeFileSync(tasksFile, JSON.stringify(tasksData, null, 2) + '\n', 'utf8');
        console.log(`  ✅ sprint-tasks-${SPRINT_ID}.json → status: Done`);
      } else {
        console.log(`  [DRY] Task "${SLUG}" → Done, drive_link: ${publishUrl}`);
      }
    } else {
      console.warn(`  ⚠️  Task not found in sprint-tasks — skipping update`);
    }
  } else {
    console.warn(`  ⚠️  sprint-tasks-${SPRINT_ID}.json not found — skipping update`);
  }

  // ── Step 6 — Write social-media-trigger ───────────────────────────────────

  console.log('\n── Step 6 — Write Social Media Trigger ─────────────────');
  const triggerPath = path.join(PUBLISH_OUT, `social-media-trigger-${SPRINT_ID}.json`);
  writeJson(triggerPath, {
    sprint_id:       SPRINT_ID,
    slug:            SLUG,
    title,
    primary_keyword: keyword,
    author,
    published_url:   publishUrl,
    content_type:    'blog',
    published_at:    publishedAt,
  });

  // ── Step 7 — Telegram confirmation ────────────────────────────────────────

  console.log('\n── Step 7 — Telegram Confirmation ──────────────────────');
  telegramSend(
    `✅ Published: "${title}"\n\n` +
    `URL: ${publishUrl}\n` +
    `Author: ${author} | Words: ${item.word_count}\n` +
    `Sprint: ${SPRINT_ID}\n\n` +
    `Social media content generation starting now...`
  );

  // ── Step 8 — Trigger Social Media Engine (background) ────────────────────

  console.log('\n── Step 8 — Trigger Social Media Engine ────────────────');
  if (!DRY_RUN) {
    const sm = spawn(
      process.execPath,
      [path.join(__dirname, 'run-social-media.js'), '--sprint-id', SPRINT_ID, '--slug', SLUG],
      { detached: true, stdio: 'ignore' }
    );
    sm.unref();
    console.log('  ✅ Social media engine started in background.');
  } else {
    console.log('  [DRY] Would spawn: run-social-media.js');
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ Publishing agent complete.');
  console.log(`   Published URL: ${publishUrl}`);
  console.log(`   Publish log: publishing-agent/publish-log-${SPRINT_ID}.json`);
  console.log(`   HTML archived: publishing-agent/approved/preview-${SLUG}.html`);
  console.log('   Social media engine running in background.');
  console.log('═══════════════════════════════════════════════════════\n');
}

main();
