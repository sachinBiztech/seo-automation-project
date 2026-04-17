#!/usr/bin/env node
/**
 * sprint-pm.js
 *
 * Daily Sprint PM runner.
 * - Calculates today's sprint day from sprint_start
 * - Marks today's tasks In Progress
 * - Reassigns missed tasks to the next available day
 * - Checks dependent-task gates (editor tasks wait for writer tasks)
 * - Sends Telegram alerts (MOCK: logs to console)
 * - Writes sprint-pm-log-[date].json
 * - Updates sprint-tasks-[sprint_id].json + matching CSV
 *
 * Usage:
 *   node sprint-pm.js
 *   node sprint-pm.js --dry-run              (no writes, preview only)
 *   node sprint-pm.js --sprint-id <id>       (override auto-detected sprint ID)
 *   node sprint-pm.js --day <N>              (simulate sprint day N — for testing)
 */

'use strict';

const fs            = require('fs');
const path          = require('path');
const { spawnSync } = require('child_process');

// ── Paths ─────────────────────────────────────────────────────────────────────

const OUTPUTS_DIR   = path.join(__dirname, 'outputs');
const APPROVAL_FILE = path.join(OUTPUTS_DIR, 'sprint-approval.json');
const TELEGRAM_ID   = '-1003829892114';

// ── Arg parsing ───────────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const DRY_RUN   = args.includes('--dry-run');
const dayArgIdx = args.indexOf('--day');
const idArgIdx  = args.indexOf('--sprint-id');

const DAY_OVERRIDE      = dayArgIdx  !== -1 ? parseInt(args[dayArgIdx  + 1], 10) : null;
const SPRINT_ID_OVERRIDE = idArgIdx  !== -1 ? args[idArgIdx + 1]                 : null;

if (DRY_RUN) console.log('DRY RUN — no files will be written\n');

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  if (DRY_RUN) { console.log(`[DRY RUN] would write → ${file}`); return; }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/** Parse "Day N" → N (integer). Returns 0 if unparseable. */
function parseDayNum(dayStr) {
  const m = String(dayStr).match(/Day\s+(\d+)/i);
  return m ? parseInt(m[1], 10) : 0;
}

/** Build "Day N" string from integer. */
function dayLabel(n) {
  return `Day ${n}`;
}

/**
 * Calculate sprint day for a given date.
 * Day 1 = sprint_start itself.
 * Uses date strings "YYYY-MM-DD" — timezone-safe midnight comparison.
 */
function calcSprintDay(sprintStartStr, todayStr) {
  const start = new Date(sprintStartStr + 'T00:00:00Z');
  const today = new Date(todayStr       + 'T00:00:00Z');
  const diffMs = today - start;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

/** ISO 8601 timestamp. */
function now() {
  return new Date().toISOString();
}

/** Today as YYYY-MM-DD. */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── CSV sync ──────────────────────────────────────────────────────────────────

function csvEscape(val) {
  const s = val === null || val === undefined ? '' : String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function csvRow(fields) {
  return fields.map(csvEscape).join(',');
}

const CSV_HEADER = [
  'Sr', 'Task Type', 'Title/Target', 'Priority', 'Assigned Agent',
  'Scheduled Day', 'Status', 'Author/Owner', 'Started', 'Completed',
  'Drive Link', 'Notes',
];

/** Rebuild the CSV from the (updated) tasks array and write it. */
function syncCsv(tasks, csvFilePath) {
  const lines = [csvRow(CSV_HEADER)];
  for (const r of tasks) {
    lines.push(csvRow([
      r.sr, r.taskType, r.title, r.priority, r.assignedAgent,
      r.scheduledDay, r.status, r.authorOwner, r.started, r.completed,
      r.driveLink, r.notes,
    ]));
  }
  if (DRY_RUN) {
    console.log(`[DRY RUN] would sync CSV → ${csvFilePath}`);
    return;
  }
  fs.writeFileSync(csvFilePath, lines.join('\n') + '\n', 'utf8');
}

// ── Telegram ──────────────────────────────────────────────────────────────────

const telegramLog = [];

function sendTelegram(message) {
  console.log('\n[TELEGRAM]');
  console.log(message);
  console.log('[/TELEGRAM]\n');

  if (!DRY_RUN) {
    const r = spawnSync(
      'openclaw', ['message', 'send',
        '--channel', 'telegram',
        '--target', TELEGRAM_ID,
        '--message', message,
      ],
      { encoding: 'utf8', timeout: 30000 }
    );
    if (r.status !== 0) {
      console.warn(`  ⚠️  Telegram send failed (exit ${r.status}): ${r.stderr || r.stdout || ''}`.trim());
    } else {
      console.log('  ✅ Telegram sent.');
    }
  }

  telegramLog.push({ sent_at: now(), message });
}

// ── Dependency check ──────────────────────────────────────────────────────────

/**
 * Returns true if this task's dependencies are satisfied.
 * Rule: content-editor tasks require the matching content-writer task
 * (same sr-1, or same title prefix) to have status === "Completed".
 */
function dependenciesMet(task, allTasks) {
  if (task.assignedAgent !== 'content-editor') return true;

  // Look for a content-writer task with sr = task.sr - 1
  const paired = allTasks.find(
    t => t.assignedAgent === 'content-writer' && t.sr === task.sr - 1
  );

  if (!paired) return true; // No paired writer — allow through

  if (paired.status !== 'Completed') {
    return false;
  }
  return true;
}

// ── Agent Trigger ─────────────────────────────────────────────────────────────

const SEO_DIR = path.join(path.dirname(path.resolve(__filename)));

/**
 * Triggers the correct execution script per task type.
 * Content   → run-content-pipeline.js (full chain: Strategist→Writer→Editor→Graphics→HTML→Telegram APPROVE)
 * Technical → run-technical-pipeline.js (not yet built — MOCK log)
 * Off-Page  → run-offpage-pipeline.js  (not yet built — MOCK log)
 */
function triggerAgent(task, sprintId) {
  console.log(
    `  TRIGGER: [${task.taskType}] "${task.title.slice(0, 60)}${task.title.length > 60 ? '…' : ''}"`
  );

  if (task.taskType === 'Content') {
    if (DRY_RUN) {
      console.log(`    [DRY] Would run: node run-content-pipeline.js --sprint-id ${sprintId} --task-id ${task.sr}`);
      return 'content-pipeline';
    }

    const result = spawnSync(
      'node',
      [
        path.join(SEO_DIR, 'run-content-pipeline.js'),
        '--sprint-id', sprintId,
        '--task-id',   String(task.sr),
      ],
      { encoding: 'utf8', timeout: 900000, stdio: 'inherit' } // 15 min — writing takes time
    );

    if (result.status !== 0) {
      console.error(`    ❌ Content pipeline failed for task ${task.sr}`);
      sendTelegram(`❌ Content pipeline failed\nSprint: ${sprintId}\nTask: ${task.title}`);
    }
    return 'content-pipeline';
  }

  if (task.taskType === 'Technical') {
    if (DRY_RUN) {
      console.log(`    [DRY] Would run: node run-technical-pipeline.js --sprint-id ${sprintId} --task-id ${task.sr}`);
      return 'technical-pipeline';
    }
    const result = spawnSync(
      'node',
      [
        path.join(SEO_DIR, 'run-technical-pipeline.js'),
        '--sprint-id', sprintId,
        '--task-id',   String(task.sr),
      ],
      { encoding: 'utf8', timeout: 300000, stdio: 'inherit' }
    );
    if (result.status !== 0) {
      console.error(`    ❌ Technical pipeline failed for task ${task.sr}`);
      sendTelegram(`❌ Technical pipeline failed\nSprint: ${sprintId}\nTask: ${task.title}`);
    }
    return 'technical-pipeline';
  }

  if (task.taskType === 'Off-Page') {
    if (DRY_RUN) {
      console.log(`    [DRY] Would run: node run-offpage-pipeline.js --sprint-id ${sprintId} --task-id ${task.sr}`);
      return 'offpage-pipeline';
    }
    const result = spawnSync(
      'node',
      [
        path.join(SEO_DIR, 'run-offpage-pipeline.js'),
        '--sprint-id', sprintId,
        '--task-id',   String(task.sr),
      ],
      { encoding: 'utf8', timeout: 300000, stdio: 'inherit' }
    );
    if (result.status !== 0) {
      console.error(`    ❌ Off-Page pipeline failed for task ${task.sr}`);
      sendTelegram(`❌ Off-Page pipeline failed\nSprint: ${sprintId}\nTask: ${task.title}`);
    }
    return 'offpage-pipeline';
  }

  console.log(`    [UNKNOWN TYPE] ${task.taskType} — skipping`);
  return 'unknown';
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  // ── 1. Load sprint-approval.json ────────────────────────────────────────────

  if (!fs.existsSync(APPROVAL_FILE)) {
    console.error(`ERROR: ${APPROVAL_FILE} not found. Run task-sheet-populator.js first.`);
    process.exit(1);
  }
  const approval = readJson(APPROVAL_FILE);

  if (approval.status !== 'approved') {
    console.error(`ERROR: Sprint not approved (status: "${approval.status}"). Sprint PM cannot run.`);
    process.exit(1);
  }

  const sprintId    = SPRINT_ID_OVERRIDE || approval.sprint_id;
  const sprintStart = approval.sprint_start;
  const sprintEnd   = approval.sprint_end;

  // ── 2. Load sprint-tasks JSON ────────────────────────────────────────────────

  const tasksFile = path.join(OUTPUTS_DIR, `sprint-tasks-${sprintId}.json`);
  if (!fs.existsSync(tasksFile)) {
    console.error(`ERROR: ${tasksFile} not found. Run task-sheet-populator.js first.`);
    process.exit(1);
  }
  const taskData = readJson(tasksFile);
  const tasks    = taskData.tasks; // mutated in place

  // ── 3. Calculate sprint day ──────────────────────────────────────────────────

  const today    = todayStr();
  const sprintDay = DAY_OVERRIDE !== null ? DAY_OVERRIDE : calcSprintDay(sprintStart, today);

  console.log('═══════════════════════════════════════════════════════');
  console.log(`Sprint PM — ${today}`);
  console.log(`Sprint:     ${sprintId}`);
  console.log(`Period:     ${sprintStart} → ${sprintEnd}`);
  console.log(`Sprint Day: Day ${sprintDay}${DAY_OVERRIDE !== null ? ' (OVERRIDE)' : ''}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // ── 4. Sprint not started yet ────────────────────────────────────────────────

  if (sprintDay <= 0) {
    console.log(`Sprint starts on ${sprintStart}. Today is ${today}. Nothing to do yet.`);
    process.exit(0);
  }

  // ── 5. Sprint complete ───────────────────────────────────────────────────────

  if (sprintDay > 10) {
    const incomplete = tasks.filter(t => !['Completed', 'Done'].includes(t.status));
    console.log(`Sprint ${sprintId} is complete (Day ${sprintDay} > Day 10).`);

    let carryoverMsg = '';
    if (incomplete.length > 0) {
      carryoverMsg = `\n⚠️ ${incomplete.length} task(s) incomplete — carried to next sprint as P1:\n` +
        incomplete.map(t => `  • [${t.taskType}] ${t.title}`).join('\n');
      console.log(carryoverMsg);
    }

    sendTelegram(
      `🏁 Sprint ${sprintId} complete. Day ${sprintDay} passed.\n` +
      (incomplete.length > 0
        ? `⚠️ ${incomplete.length} unfinished task(s) carried to next sprint as Priority 1.`
        : `✅ All tasks completed.`)
    );

    writeLog(sprintId, sprintDay, today, [], [], [], true, taskData.site);
    process.exit(0);
  }

  // ── 6. Find today's tasks ────────────────────────────────────────────────────

  const todayTasks = tasks.filter(
    t => parseDayNum(t.scheduledDay) === sprintDay && t.status === 'Not Started'
  );

  console.log(`Tasks scheduled for Day ${sprintDay}: ${todayTasks.length}`);

  // ── 7. Find missed tasks (past days, still Not Started) ──────────────────────

  const missedTasks = tasks.filter(
    t => parseDayNum(t.scheduledDay) < sprintDay && t.status === 'Not Started'
  );

  if (missedTasks.length > 0) {
    console.log(`\nMissed tasks (past day, not started): ${missedTasks.length}`);
    const nextDay = sprintDay + 1;
    const reassignedTitles = [];
    for (const t of missedTasks) {
      console.log(`  REASSIGN: [${t.taskType}] "${t.title.slice(0, 60)}" → ${dayLabel(nextDay)}`);
      const originalDay = t.scheduledDay;
      t.scheduledDay = dayLabel(nextDay);
      reassignedTitles.push(`${t.title} (was ${originalDay})`);
    }
    sendTelegram(
      `⚠️ Sprint ${sprintId} — ${missedTasks.length} task(s) from past days not started:\n` +
      missedTasks.map(t => `  • [${t.taskType}] ${t.title}`).join('\n') +
      `\n\nAll reassigned to ${dayLabel(nextDay)}.`
    );
  }

  // ── 8. Process today's tasks ─────────────────────────────────────────────────

  const triggeredTasks = [];
  const heldTasks      = [];

  console.log(`\nProcessing Day ${sprintDay} tasks:`);

  if (todayTasks.length === 0) {
    console.log('  (none scheduled for today)');
  }

  for (const task of todayTasks) {
    // Dependency gate
    if (!dependenciesMet(task, tasks)) {
      const blocker = tasks.find(
        t => t.assignedAgent === 'content-writer' && t.sr === task.sr - 1
      );
      const blockerDesc = blocker
        ? `"${blocker.title}" is ${blocker.status}`
        : 'paired writer task incomplete';

      console.log(`  HELD:    [${task.taskType}] "${task.title.slice(0, 60)}" — dependency: ${blockerDesc}`);
      heldTasks.push(task.title);

      sendTelegram(
        `⛔ Sprint ${sprintId} — task held (dependency not met):\n` +
        `  Task: [${task.taskType}] ${task.title}\n` +
        `  Waiting for: ${blockerDesc}\n` +
        `  Action required: complete the dependency first.`
      );
      continue;
    }

    // Trigger and mark In Progress
    const agent = triggerAgent(task, sprintId);
    task.status  = 'In Progress';
    task.started = now();
    triggeredTasks.push(task.title);

    console.log(`  STARTED: [${task.taskType}] "${task.title.slice(0, 60)}" → ${agent}`);
  }

  // ── 9. Send daily summary Telegram ──────────────────────────────────────────

  if (todayTasks.length > 0 || missedTasks.length > 0) {
    const parts = [
      `📅 Sprint PM — Day ${sprintDay} of 10`,
      `Sprint: ${sprintId}`,
      '',
    ];

    if (triggeredTasks.length > 0) {
      parts.push(`🚀 Triggered today (${triggeredTasks.length}):`);
      triggeredTasks.forEach(t => parts.push(`  • ${t}`));
    }

    if (heldTasks.length > 0) {
      parts.push(`\n⛔ Held — dependency not met (${heldTasks.length}):`);
      heldTasks.forEach(t => parts.push(`  • ${t}`));
    }

    if (missedTasks.length > 0) {
      parts.push(`\n⚠️ Reassigned to ${dayLabel(sprintDay + 1)} (${missedTasks.length}):`);
      missedTasks.forEach(t => parts.push(`  • ${t.title}`));
    }

    const remaining = tasks.filter(t => t.status === 'Not Started').length;
    parts.push(`\n📊 Total remaining: ${remaining} / ${tasks.length}`);

    sendTelegram(parts.join('\n'));
  } else {
    console.log('\nNo tasks triggered and no missed tasks. Nothing to report.');
  }

  // ── 10. Persist updated JSON + CSV ──────────────────────────────────────────

  taskData.tasks = tasks;
  writeJson(tasksFile, taskData);

  const csvFile = taskData.csv_file || path.join(OUTPUTS_DIR, `sprint-tasks-${sprintId}.csv`);
  syncCsv(tasks, csvFile);

  // ── 11. Write PM log ─────────────────────────────────────────────────────────

  writeLog(
    sprintId, sprintDay, today,
    triggeredTasks,
    missedTasks.map(t => t.title),
    heldTasks,
    false,
    taskData.site
  );

  // ── 12. Final summary ────────────────────────────────────────────────────────

  console.log('\n─────────────────────────────────────');
  console.log(`Triggered : ${triggeredTasks.length}`);
  console.log(`Reassigned: ${missedTasks.length}`);
  console.log(`Held      : ${heldTasks.length}`);
  console.log(`Remaining : ${tasks.filter(t => t.status === 'Not Started').length}`);
  console.log('─────────────────────────────────────');
  console.log(`JSON updated → ${tasksFile}`);
  console.log(`CSV synced   → ${csvFile}`);
}

// ── Log writer ────────────────────────────────────────────────────────────────

function writeLog(sprintId, sprintDay, date, triggered, reassigned, held, sprintComplete, site) {
  const logFile = path.join(OUTPUTS_DIR, `sprint-pm-log-${date}.json`);
  const log = {
    run_date: now(),
    run_date_local: date,
    sprint_id: sprintId,
    site: site || '',
    sprint_day: sprintDay,
    sprint_complete: sprintComplete,
    tasks_triggered: triggered,
    tasks_reassigned: reassigned,
    tasks_held: held,
    telegram_sent: telegramLog.length > 0,
    telegram_messages: telegramLog,
  };
  writeJson(logFile, log);
  if (!DRY_RUN) console.log(`PM log        → ${logFile}`);
}

// ── Run ───────────────────────────────────────────────────────────────────────

main();
