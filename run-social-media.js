#!/usr/bin/env node
/**
 * run-social-media.js
 *
 * Triggers the social-media agent after a publish event.
 *
 * Usage:
 *   node run-social-media.js --sprint-id biztechcs_sprint_2026-04-17 --slug odoo-impl
 *   node run-social-media.js --sprint-id X --slug Y --dry-run
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const WORKSPACE      = '/home/sachin.p/.openclaw/workspace';
const OUTPUTS_DIR    = path.join(WORKSPACE, 'seo-automation', 'outputs');
const PUBLISH_OUT    = path.join(OUTPUTS_DIR, 'publishing-agent');
const SOCIAL_OUT     = path.join(OUTPUTS_DIR, 'social-media');

const args      = process.argv.slice(2);
const getArg    = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const SPRINT_ID = getArg('--sprint-id');
const SLUG      = getArg('--slug');
const DRY_RUN   = args.includes('--dry-run');

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

function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Social Media Engine — ${SPRINT_ID}`);
  if (SLUG) console.log(`Slug: ${SLUG}`);
  if (DRY_RUN) console.log('Mode: DRY RUN');
  console.log('═══════════════════════════════════════════════════════\n');

  const triggerFile = path.join(PUBLISH_OUT, `social-media-trigger-${SPRINT_ID}.json`);
  if (!fs.existsSync(triggerFile)) {
    console.error(`ERROR: social-media-trigger-${SPRINT_ID}.json not found`);
    process.exit(1);
  }

  const trigger = JSON.parse(fs.readFileSync(triggerFile, 'utf8'));
  console.log(`Article: ${trigger.title}`);
  console.log(`URL: ${trigger.published_url}\n`);

  if (DRY_RUN) {
    console.log('[DRY RUN] Would call: openclaw agent --agent social-media');
    return;
  }

  clearSession('social-media');
  console.log('🤖 Starting social-media agent...\n');

  const result = spawnSync(
    'openclaw',
    [
      'agent', '--agent', 'social-media',
      '--message',
      `Read the file seo-automation/social-media/orchestrator.md and follow ALL instructions exactly. ` +
      `There are NO shell scripts — do not look for any .sh files. ` +
      `Use the write tool to save all outputs directly. ` +
      `Sprint ID: ${SPRINT_ID}. Slug: ${trigger.slug}. ` +
      `Published URL: ${trigger.published_url}. Title: ${trigger.title}. ` +
      `Primary keyword: ${trigger.primary_keyword}. ` +
      `Mode: MOCK — generate fictional news items, auto-approve all ideas, auto-approve all posts (Step 5), write output files. ` +
      `Do not ask questions — execute all 6 steps and write the output files.`,
    ],
    { encoding: 'utf8', stdio: 'inherit', timeout: 600000 }
  );

  if (result.status !== 0) {
    console.error('\n💥 Social media agent failed with exit code:', result.status);
    process.exit(1);
  }

  const postsFile = path.join(SOCIAL_OUT, `social-posts-${SPRINT_ID}.json`);
  const queueFile = path.join(SOCIAL_OUT, `social-manual-queue-${SPRINT_ID}.md`);

  if (fs.existsSync(postsFile)) console.log(`\n✅ Social posts: social-posts-${SPRINT_ID}.json`);
  if (fs.existsSync(queueFile)) console.log(`✅ Manual queue: social-manual-queue-${SPRINT_ID}.md`);
  console.log('\nSocial media engine complete.');
}

main();
