#!/usr/bin/env node
/**
 * callback-listener.js
 * Standalone Telegram callback_query poller.
 * Bypasses the main OpenClaw agent entirely.
 *
 * Listens for approve|, revise|, reject| callback_data,
 * calls approval-bridge.js immediately, then answers the callback.
 *
 * Usage:
 *   node callback-listener.js          # run in foreground
 *   node callback-listener.js &        # run in background
 */

const https = require('https');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ── Config ────────────────────────────────────────────────────────────────────

function getBotToken() {
  const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const token = config?.channels?.telegram?.botToken;
  if (!token) throw new Error('Telegram botToken not found in ~/.openclaw/openclaw.json');
  return token;
}

const BOT_TOKEN = getBotToken();
const SCRIPT_DIR = __dirname;
const BRIDGE_SCRIPT = path.join(SCRIPT_DIR, 'approval-bridge.js');
const LOG_FILE = path.join(SCRIPT_DIR, 'outputs', 'callback-listener.log');
const OFFSET_FILE = path.join(SCRIPT_DIR, 'outputs', 'callback-listener-offset.json');
const POLL_TIMEOUT = 30; // seconds — long polling

const KNOWN_ACTIONS = ['approve', 'revise', 'reject'];

// ── Logging ───────────────────────────────────────────────────────────────────

function log(level, msg, data) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level.toUpperCase()}] ${msg}${data ? ' ' + JSON.stringify(data) : ''}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch (_) {}
}

// ── Offset persistence ────────────────────────────────────────────────────────

function loadOffset() {
  try {
    return JSON.parse(fs.readFileSync(OFFSET_FILE, 'utf8')).offset || 0;
  } catch (_) {
    return 0;
  }
}

function saveOffset(offset) {
  fs.writeFileSync(OFFSET_FILE, JSON.stringify({ offset }) + '\n');
}

// ── Telegram API ──────────────────────────────────────────────────────────────

function telegramRequest(method, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function getUpdates(offset) {
  return telegramRequest('getUpdates', {
    offset,
    timeout: POLL_TIMEOUT,
    allowed_updates: ['callback_query'],
  });
}

async function answerCallbackQuery(callbackQueryId, text) {
  return telegramRequest('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: false,
  });
}

// ── Bridge caller ─────────────────────────────────────────────────────────────

function callBridge(callbackData, actor) {
  const nodeExe = process.execPath; // use the same node that runs this script
  log('info', `Calling bridge: ${callbackData} actor=${actor}`);
  try {
    const output = execFileSync(nodeExe, [BRIDGE_SCRIPT, callbackData, actor], {
      encoding: 'utf8',
      timeout: 10000,
    });
    log('info', 'Bridge output', JSON.parse(output.trim()));
    return { ok: true, output };
  } catch (err) {
    log('error', 'Bridge failed', { message: err.message, stderr: err.stderr });
    return { ok: false, error: err.message };
  }
}

// ── Callback handler ──────────────────────────────────────────────────────────

async function handleCallbackQuery(cq) {
  const id = cq.id;
  const data = cq.data || '';
  const from = cq.from?.username || cq.from?.first_name || String(cq.from?.id);

  const [action, entityId] = data.split('|');

  if (!KNOWN_ACTIONS.includes(action) || !entityId) {
    log('info', `Ignoring unknown callback: ${data}`);
    // Still answer to dismiss the spinner
    await answerCallbackQuery(id, '').catch(() => {});
    return;
  }

  log('info', `Received callback: action=${action} entity=${entityId} from=${from}`);

  // Call the bridge immediately before answering (bridge is fast, < 100ms)
  const result = callBridge(data, from);

  // Answer the callback query (dismiss the loading spinner on the button)
  const replyText = result.ok
    ? action === 'approve'
      ? '✅ Sprint approved!'
      : action === 'revise'
      ? '🔄 Revision requested.'
      : '❌ Sprint rejected.'
    : '⚠️ Action received but update failed. Check logs.';

  try {
    await answerCallbackQuery(id, replyText);
    log('info', `Answered callback ${id}`);
  } catch (err) {
    log('warn', `answerCallbackQuery failed (query may have expired): ${err.message}`);
  }
}

// ── Poll loop ─────────────────────────────────────────────────────────────────

async function poll() {
  let offset = loadOffset();
  log('info', `Callback listener started. Polling from offset=${offset}`);

  while (true) {
    try {
      const response = await getUpdates(offset);

      if (!response.ok) {
        log('error', 'getUpdates returned not ok', response);
        await sleep(5000);
        continue;
      }

      for (const update of response.result || []) {
        offset = update.update_id + 1;
        saveOffset(offset);

        if (update.callback_query) {
          await handleCallbackQuery(update.callback_query);
        }
      }
    } catch (err) {
      log('error', `Poll error: ${err.message}`);
      await sleep(5000);
    }
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Start ─────────────────────────────────────────────────────────────────────

poll().catch((err) => {
  log('error', `Fatal: ${err.message}`);
  process.exit(1);
});
