#!/usr/bin/env node
/**
 * run-social-media.js — thin launcher
 *
 * Calls `openclaw agent --agent social-media`.
 * All business logic (aggregation, idea bank, IST scheduling) lives in:
 *   social-media/orchestrator.md
 *
 * Triggered automatically by publishing-agent after publish.
 *
 * Usage:
 *   node run-social-media.js --sprint-id biztechcs_sprint_2026-04-27 --slug odoo-impl-india
 *   node run-social-media.js --sprint-id X --slug Y --dry-run
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const WORKSPACE   = '/home/sachin.p/.openclaw/workspace';
const SEO_DIR     = path.join(WORKSPACE, 'seo-automation');
const PUBLISH_OUT = path.join(SEO_DIR, 'outputs', 'publishing-agent');

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

// Verify publishing trigger exists before calling agent
const triggerFile = path.join(PUBLISH_OUT, `social-media-trigger-${SPRINT_ID}.json`);
if (!DRY_RUN && !fs.existsSync(triggerFile)) {
  console.error(`ERROR: social-media-trigger-${SPRINT_ID}.json not found — publishing agent must run first`);
  process.exit(1);
}

// Ensure trigger file has the correct slug for THIS run.
// Publishing agent always overwrites it with the latest slug — if we're backfilling
// an earlier slug, rewrite the trigger to match before the agent reads it.
if (!DRY_RUN && fs.existsSync(triggerFile)) {
  try {
    const currentTrigger = JSON.parse(fs.readFileSync(triggerFile, 'utf8'));
    if (currentTrigger.slug !== SLUG) {
      // Try to get article metadata from publish-log
      const publishLogPath = path.join(PUBLISH_OUT, `publish-log-${SPRINT_ID}.json`);
      let articleMeta = null;
      if (fs.existsSync(publishLogPath)) {
        const log = JSON.parse(fs.readFileSync(publishLogPath, 'utf8'));
        const articles = log.published_articles || [];
        articleMeta = articles.find(a => a.slug === SLUG);
      }
      const correctedTrigger = {
        sprint_id: SPRINT_ID,
        slug: SLUG,
        title: articleMeta ? articleMeta.title : SLUG,
        primary_keyword: articleMeta ? articleMeta.keyword : SLUG.replace(/-/g, ' '),
        author: articleMeta ? articleMeta.author : 'BiztechCS',
        published_url: `https://www.biztechcs.com/blog/${SLUG}/`,
        content_type: 'blog',
        published_at: articleMeta ? articleMeta.published_at : new Date().toISOString(),
      };
      fs.writeFileSync(triggerFile, JSON.stringify(correctedTrigger));
      console.log(`📌 Trigger rewritten for slug: ${SLUG}`);
    }
  } catch (e) {
    console.warn('⚠️  Could not update trigger file:', e.message);
  }
}

if (DRY_RUN) {
  console.log(`[DRY] Social Media Engine — Sprint: ${SPRINT_ID} | Slug: ${SLUG}`);
  console.log('[DRY] Would call: openclaw agent --agent social-media');
  process.exit(0);
}

clearSession('social-media');
console.log(`Social Media Engine Launcher — ${SPRINT_ID} / ${SLUG}`);
console.log('🤖 Launching social-media agent (all steps run inside agent)...\n');

const socialPostsFile = path.join(SEO_DIR, 'outputs', 'social-media', `social-posts-${SPRINT_ID}.json`);

// Snapshot the existing social-posts JSON before agent runs (to preserve other slugs' data)
let existingArticles = [];
if (fs.existsSync(socialPostsFile)) {
  try {
    const existing = JSON.parse(fs.readFileSync(socialPostsFile, 'utf8'));
    if (Array.isArray(existing.articles)) {
      // Already multi-article format — keep all OTHER slugs
      existingArticles = existing.articles.filter(a => a.slug !== SLUG);
    }
    // Old single-article format: discard (will be replaced by new data)
  } catch (_) {}
}

execFileSync('openclaw', [
  'agent', '--agent', 'social-media',
  '--message',
  `Run the social media engine for sprint ${SPRINT_ID} slug ${SLUG}. ` +
  `Trigger file: seo-automation/outputs/publishing-agent/social-media-trigger-${SPRINT_ID}.json. ` +
  'Read seo-automation/social-media/orchestrator.md and execute ALL 6 steps: ' +
  'aggregation (MOCK: generate fictional news), idea bank (15–20 ideas), ' +
  'Telegram approval (MOCK: auto-approve all), post creation with platform-native copy, ' +
  'post approval (MOCK: auto-approve all), scheduling with IST times (format: YYYY-MM-DDTHH:MM:SS+05:30). ' +
  `Write output to seo-automation/outputs/social-media/social-posts-${SPRINT_ID}.json as a single-article JSON with the slug "${SLUG}" at the top level. ` +
  'Also write manual-queue MD to disk.',
], { stdio: 'inherit', timeout: 600000 });

// Merge: read what agent just wrote, combine with other slugs' data
if (fs.existsSync(socialPostsFile)) {
  try {
    const agentOutput = JSON.parse(fs.readFileSync(socialPostsFile, 'utf8'));
    // Extract this slug's article data from whatever format the agent used
    let newArticle = null;
    if (Array.isArray(agentOutput.articles) && agentOutput.articles.length > 0) {
      newArticle = agentOutput.articles.find(a => a.slug === SLUG) || agentOutput.articles[0];
    } else {
      // Agent wrote single-object format — wrap it
      newArticle = { slug: SLUG, ...agentOutput };
      delete newArticle.sprint_id;
    }
    if (newArticle) {
      newArticle.slug = SLUG; // ensure slug field is set
      const merged = {
        sprint_id: SPRINT_ID,
        articles: [...existingArticles, newArticle],
      };
      fs.writeFileSync(socialPostsFile, JSON.stringify(merged, null, 2));
      console.log(`\n✅ social-posts merged: ${merged.articles.length} article(s) in file`);
    }
  } catch (e) {
    console.warn('⚠️  Could not merge social-posts JSON:', e.message);
  }
}

console.log('\n✅ Social media engine complete.');
