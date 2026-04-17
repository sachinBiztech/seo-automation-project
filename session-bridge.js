#!/usr/bin/env node
/**
 * session-bridge.js
 * Watches the OpenClaw main agent's Telegram group session file.
 * When it detects a callback_data pattern (approve|, revise|, reject|)
 * in an incoming user message, immediately calls approval-bridge.js.
 *
 * This bypasses the LLM entirely — no more hallucinated "status updated" replies.
 *
 * Usage:
 *   node session-bridge.js           # run in foreground
 *   node session-bridge.js &         # run in background
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

// ── Config ────────────────────────────────────────────────────────────────────

const SESSIONS_JSON = path.join(os.homedir(), '.openclaw', 'agents', 'main', 'sessions', 'sessions.json');
const TARGET_SESSION_KEY = 'agent:main:telegram:group:-1003829892114';
const BRIDGE_SCRIPT = path.join(__dirname, 'approval-bridge.js');
const LOG_FILE = path.join(__dirname, 'outputs', 'session-bridge.log');
const STATE_FILE = path.join(__dirname, 'outputs', 'session-bridge-state.json');

const CALLBACK_PATTERN = /^(approve|revise|reject)\|(\S+)$/;
const POLL_INTERVAL_MS = 500; // check every 500ms

// ── Logging ───────────────────────────────────────────────────────────────────

function log(level, msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level.toUpperCase()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch (_) {}
}

// ── State ─────────────────────────────────────────────────────────────────────

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (_) {
    return { lastByteOffset: 0, sessionFile: null };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

// ── Session file discovery ────────────────────────────────────────────────────

function getSessionFile() {
  try {
    const sessions = JSON.parse(fs.readFileSync(SESSIONS_JSON, 'utf8'));
    const entry = sessions[TARGET_SESSION_KEY];
    if (!entry || !entry.sessionFile) return null;
    return entry.sessionFile;
  } catch (_) {
    return null;
  }
}

// ── Bridge caller ─────────────────────────────────────────────────────────────

function callBridge(callbackData, actor) {
  log('info', `Calling bridge: ${callbackData} actor=${actor}`);
  try {
    const output = execFileSync(process.execPath, [BRIDGE_SCRIPT, callbackData, actor], {
      encoding: 'utf8',
      timeout: 10000,
    });
    const parsed = JSON.parse(output.trim());
    if (parsed.skipped) {
      log('info', `Bridge skipped — already in terminal state: ${parsed.current_status}`);
    } else {
      log('info', `Bridge OK: action=${parsed.action} kind=${parsed.kind}`);
    }
  } catch (err) {
    log('error', `Bridge failed: ${err.message}`);
  }
}

// ── Line parser ───────────────────────────────────────────────────────────────

function processLine(rawLine) {
  const line = rawLine.trim();
  if (!line) return;

  let entry;
  try {
    entry = JSON.parse(line);
  } catch (_) {
    return;
  }

  // Only process user messages
  const msg = entry.message;
  if (!msg || msg.role !== 'user') return;

  const content = msg.content;
  const textParts = [];

  if (typeof content === 'string') {
    textParts.push(content);
  } else if (Array.isArray(content)) {
    for (const part of content) {
      if (part && part.type === 'text' && typeof part.text === 'string') {
        textParts.push(part.text);
      }
    }
  }

  for (const text of textParts) {
    // Extract last non-empty line (callback_data is often the last line of the message)
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const chunk of lines) {
      const match = chunk.match(CALLBACK_PATTERN);
      if (match) {
        const action = match[1];
        const entityId = match[2];
        const callbackData = `${action}|${entityId}`;
        log('info', `Detected callback: ${callbackData}`);
        callBridge(callbackData, 'telegram');
        return; // only process first match per message
      }
    }
  }
}

// ── File tail ─────────────────────────────────────────────────────────────────

function readNewLines(filePath, byteOffset) {
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch (_) {
    return { lines: [], newOffset: byteOffset };
  }

  if (stat.size <= byteOffset) {
    // File shrunk (reset) — restart from beginning
    if (stat.size < byteOffset) {
      log('info', 'Session file was reset — restarting from beginning');
      byteOffset = 0;
    }
    return { lines: [], newOffset: byteOffset };
  }

  const fd = fs.openSync(filePath, 'r');
  const bytesToRead = stat.size - byteOffset;
  const buf = Buffer.alloc(bytesToRead);
  fs.readSync(fd, buf, 0, bytesToRead, byteOffset);
  fs.closeSync(fd);

  const newOffset = byteOffset + bytesToRead;
  const chunk = buf.toString('utf8');
  const lines = chunk.split('\n').filter(l => l.trim());

  return { lines, newOffset };
}

// ── Main poll loop ────────────────────────────────────────────────────────────

async function poll() {
  let state = loadState();
  let currentSessionFile = state.sessionFile;
  let byteOffset = state.lastByteOffset;

  // Check if the session file has changed
  const latestSessionFile = getSessionFile();
  if (latestSessionFile && latestSessionFile !== currentSessionFile) {
    log('info', `Session file changed: ${latestSessionFile}`);
    currentSessionFile = latestSessionFile;
    byteOffset = 0; // reset offset for new file
    state = { sessionFile: currentSessionFile, lastByteOffset: 0 };
    saveState(state);
  }

  if (!currentSessionFile) {
    log('warn', `Session key "${TARGET_SESSION_KEY}" not found in sessions.json — waiting...`);
    return;
  }

  if (!fs.existsSync(currentSessionFile)) {
    log('warn', `Session file does not exist: ${currentSessionFile}`);
    return;
  }

  const { lines, newOffset } = readNewLines(currentSessionFile, byteOffset);

  if (lines.length > 0) {
    for (const line of lines) {
      processLine(line);
    }
    state.lastByteOffset = newOffset;
    state.sessionFile = currentSessionFile;
    saveState(state);
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  log('info', `Session bridge started. Watching: ${TARGET_SESSION_KEY}`);
  log('info', `Sessions file: ${SESSIONS_JSON}`);
  log('info', `Bridge script: ${BRIDGE_SCRIPT}`);

  // Seed byte offset to current file size — don't process old history
  const sessionFile = getSessionFile();
  if (sessionFile && fs.existsSync(sessionFile)) {
    const existing = loadState();
    if (!existing.sessionFile || existing.sessionFile !== sessionFile) {
      const size = fs.statSync(sessionFile).size;
      log('info', `Seeding offset to ${size} (skipping existing history)`);
      saveState({ sessionFile, lastByteOffset: size });
    } else {
      log('info', `Resuming from offset ${existing.lastByteOffset}`);
    }
  }

  while (true) {
    try {
      // Re-check for session file changes on every iteration
      const latestFile = getSessionFile();
      const currentState = loadState();

      if (latestFile && latestFile !== currentState.sessionFile) {
        log('info', `Session file changed to: ${latestFile}`);
        saveState({ sessionFile: latestFile, lastByteOffset: 0 });
      }

      await poll();
    } catch (err) {
      log('error', `Poll error: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
}

main().catch(err => {
  log('error', `Fatal: ${err.message}`);
  process.exit(1);
});
