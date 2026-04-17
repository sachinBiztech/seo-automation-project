#!/usr/bin/env node
/**
 * task-sheet-populator.js
 *
 * Reads sprint-approval.json (must be "approved") + sprint-plan.json
 * Writes outputs/sprint-tasks-[sprint_id].csv
 *
 * Columns: Sr, Task Type, Title/Target, Priority, Assigned Agent,
 *          Scheduled Day, Status, Author/Owner, Started, Completed,
 *          Drive Link, Notes
 *
 * Usage:
 *   node task-sheet-populator.js
 *   node task-sheet-populator.js --sprint-id biztechcs_sprint_2026-04-15
 */

const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────

const OUTPUTS_DIR    = path.join(__dirname, 'outputs');
const APPROVAL_FILE  = path.join(OUTPUTS_DIR, 'sprint-approval.json');
const SPRINT_FILE    = path.join(OUTPUTS_DIR, 'sprint-plan.json');

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function csvRow(fields) {
  return fields.map(csvEscape).join(',');
}

// ── Scheduling logic (from plan.md Phase 4.2) ─────────────────────────────────
//   Day 1  — Technical SEO fixes + all off-page outreach dispatched
//   Days 2–5 — Writing batch
//   Day 10 — Social scheduling

function scheduledDay(taskType, priority, index) {
  switch (taskType) {
    case 'Technical':
      return 'Day 1';
    case 'Off-Page':
      return 'Day 1';
    case 'Content':
      // P1 → Days 1–4, P2 → Days 4–7, Optional → Days 8–10
      if (priority === 'HIGH' || priority === 'P1') {
        const base = 2;
        return `Day ${base + (index % 4)}`;
      } else {
        const base = 5;
        return `Day ${base + (index % 3)}`;
      }
    default:
      return 'Day 1';
  }
}

// ── Row builders ──────────────────────────────────────────────────────────────

function buildContentRows(plan, startSr) {
  const rows = [];
  let sr = startSr;
  let contentIndex = 0;

  const allContent = [
    ...(plan.content_plan.items.blog_posts || []).map(b => ({ ...b, subtype: 'Blog Post' })),
    ...(plan.content_plan.items.listicles  || []).map(l => ({ ...l, subtype: 'Listicle' })),
    ...(plan.content_plan.items.page_rewrites || []).map(r => ({ ...r, subtype: 'Page Rewrite' })),
  ].sort((a, b) => a.priority - b.priority);

  for (const item of allContent) {
    const priority = item.priority === 1 ? 'P1' : item.priority === 2 ? 'P2' : 'Optional';
    rows.push({
      sr: sr++,
      taskType: 'Content',
      title: item.title,
      priority,
      assignedAgent: 'content-writer',
      scheduledDay: scheduledDay('Content', priority, contentIndex++),
      status: 'Not Started',
      authorOwner: item.author || '',
      started: '',
      completed: '',
      driveLink: '',
      notes: `Keyword: ${item.primary_keyword} | Target: ${item.target_word_count} words | Vector ${item.vector}`,
    });
  }
  return rows;
}

function buildTechnicalRows(plan, startSr) {
  const rows = [];
  let sr = startSr;

  const allTech = [
    ...(plan.technical_plan.items.cwv_fixes      || []).map(f => ({ ...f, subtype: 'CWV Fix' })),
    ...(plan.technical_plan.items.page_fixes     || []).map(f => ({ ...f, subtype: 'Page Fix' })),
    ...(plan.technical_plan.items.structural_fixes || []).map(f => ({ ...f, subtype: 'Structural Fix' })),
  ].sort((a, b) => a.priority - b.priority);

  for (const item of allTech) {
    const priority = item.priority === 1 ? 'P1' : item.priority === 2 ? 'P2' : 'Optional';
    const title = item.metric
      ? `CWV Fix: ${item.metric} on ${plan.technical_plan.items.page_fixes?.[0]?.url || 'target page'} (${item.current_value} → ${item.target_value})`
      : `Page Fix: ${item.url} — ${item.issue_type}`;
    rows.push({
      sr: sr++,
      taskType: 'Technical',
      title,
      priority,
      assignedAgent: 'technical-seo',
      scheduledDay: 'Day 1',
      status: 'Not Started',
      authorOwner: 'technical-seo',
      started: '',
      completed: '',
      driveLink: '',
      notes: item.fix || item.diagnosis || '',
    });
  }
  return rows;
}

function buildOffPageRows(plan, startSr) {
  const rows = [];
  let sr = startSr;
  const items = plan.offpage_plan.items;

  // Backlink outreach
  for (const bl of (items.backlink_targets || [])) {
    rows.push({
      sr: sr++,
      taskType: 'Off-Page',
      title: `Backlink Outreach: ${bl.domain} → ${bl.link_to_our_page}`,
      priority: 'P1',
      assignedAgent: 'offpage-outreach',
      scheduledDay: 'Day 1',
      status: 'Not Started',
      authorOwner: 'offpage-outreach',
      started: '',
      completed: '',
      driveLink: '',
      notes: `Type: ${bl.type} | Angle: ${bl.outreach_angle}`,
    });
  }

  // Guest posts
  for (const gp of (items.guest_posts || [])) {
    rows.push({
      sr: sr++,
      taskType: 'Off-Page',
      title: `Guest Post: ${gp.target_website} — "${gp.proposed_topic}"`,
      priority: 'P1',
      assignedAgent: 'offpage-outreach',
      scheduledDay: 'Day 1',
      status: 'Not Started',
      authorOwner: 'offpage-outreach',
      started: '',
      completed: '',
      driveLink: '',
      notes: `Site value: ${gp.site_value} | Pitch: ${gp.pitch_angle}`,
    });
  }

  // Quora answers
  for (const qa of (items.quora_answers || [])) {
    rows.push({
      sr: sr++,
      taskType: 'Off-Page',
      title: `Quora Answer: "${qa.question}"`,
      priority: 'P2',
      assignedAgent: 'offpage-outreach',
      scheduledDay: 'Day 1',
      status: 'Not Started',
      authorOwner: 'offpage-outreach',
      started: '',
      completed: '',
      driveLink: '',
      notes: `Link to: ${qa.link_to} | Angle: ${qa.our_angle}`,
    });
  }

  // Reddit posts
  for (const rp of (items.reddit_posts || [])) {
    rows.push({
      sr: sr++,
      taskType: 'Off-Page',
      title: `Reddit: ${rp.subreddit} — ${rp.post_type}`,
      priority: 'P2',
      assignedAgent: 'offpage-outreach',
      scheduledDay: 'Day 1',
      status: 'Not Started',
      authorOwner: 'offpage-outreach',
      started: '',
      completed: '',
      driveLink: '',
      notes: `Link placement: ${rp.link_placement} | Angle: ${rp.post_angle}`,
    });
  }

  // LinkedIn longform
  for (const li of (items.linkedin_longform || [])) {
    rows.push({
      sr: sr++,
      taskType: 'Off-Page',
      title: `LinkedIn Article: "${li.topic}"`,
      priority: 'P2',
      assignedAgent: 'offpage-outreach',
      scheduledDay: 'Day 1',
      status: 'Not Started',
      authorOwner: 'offpage-outreach',
      started: '',
      completed: '',
      driveLink: '',
      notes: `Audience: ${li.target_audience} | Hook: ${li.hook}`,
    });
  }

  return rows;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  // 1. Check approval
  if (!fs.existsSync(APPROVAL_FILE)) {
    console.error(`ERROR: ${APPROVAL_FILE} not found`);
    process.exit(1);
  }
  const approval = readJson(APPROVAL_FILE);
  if (approval.status !== 'approved') {
    console.error(`ERROR: Sprint is not approved (status: ${approval.status}). Cannot generate task sheet.`);
    process.exit(1);
  }

  // 2. Load sprint plan
  if (!fs.existsSync(SPRINT_FILE)) {
    console.error(`ERROR: ${SPRINT_FILE} not found`);
    process.exit(1);
  }
  const plan = readJson(SPRINT_FILE);

  console.log(`Sprint: ${plan.sprint_id}`);
  console.log(`Period: ${plan.sprint_start} → ${plan.sprint_end}`);
  console.log(`Site:   ${plan.site}`);
  console.log(`Approved by: ${approval.approved_by} at ${approval.approved_at}`);
  console.log('');

  // 3. Build rows — technical first (Day 1), then content (P1 before P2), then off-page
  const techRows    = buildTechnicalRows(plan, 1);
  const contentRows = buildContentRows(plan, techRows.length + 1);
  const offRows     = buildOffPageRows(plan, techRows.length + contentRows.length + 1);
  const allRows     = [...techRows, ...contentRows, ...offRows];

  // 4. Write CSV
  const HEADER = [
    'Sr', 'Task Type', 'Title/Target', 'Priority', 'Assigned Agent',
    'Scheduled Day', 'Status', 'Author/Owner', 'Started', 'Completed',
    'Drive Link', 'Notes',
  ];

  const lines = [csvRow(HEADER)];
  for (const r of allRows) {
    lines.push(csvRow([
      r.sr, r.taskType, r.title, r.priority, r.assignedAgent,
      r.scheduledDay, r.status, r.authorOwner, r.started, r.completed,
      r.driveLink, r.notes,
    ]));
  }

  const csvContent = lines.join('\n') + '\n';
  const outFile = path.join(OUTPUTS_DIR, `sprint-tasks-${plan.sprint_id}.csv`);
  fs.writeFileSync(outFile, csvContent, 'utf8');

  // 5. Summary
  console.log(`Total rows: ${allRows.length}`);
  console.log(`  Technical : ${techRows.length}`);
  console.log(`  Content   : ${contentRows.length}`);
  console.log(`  Off-Page  : ${offRows.length}`);
  console.log('');
  console.log(`CSV written → ${outFile}`);

  // 6. Write a machine-readable summary JSON for Sprint PM
  const summaryFile = path.join(OUTPUTS_DIR, `sprint-tasks-${plan.sprint_id}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify({
    sprint_id: plan.sprint_id,
    sprint_start: plan.sprint_start,
    sprint_end: plan.sprint_end,
    site: plan.site,
    generated_at: new Date().toISOString(),
    csv_file: outFile,
    totals: {
      technical: techRows.length,
      content:   contentRows.length,
      offpage:   offRows.length,
      total:     allRows.length,
    },
    tasks: allRows,
  }, null, 2) + '\n');
  console.log(`JSON written → ${summaryFile}`);
}

main();
