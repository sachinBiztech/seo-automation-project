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
const LOG_FILE = path.join(SCRIPT_DIR, 'outputs', 'logs', 'callback-listener.log');
const OFFSET_FILE = path.join(SCRIPT_DIR, 'outputs', 'logs', 'callback-listener-offset.json');
const POLL_TIMEOUT = 30; // seconds — long polling

const KNOWN_ACTIONS = ['approve', 'revise', 'reject'];
const CONTENT_ACTIONS = ['content_approve', 'content_revise', 'content_reject'];
const CONTENT_BRIDGE_SCRIPT = path.join(SCRIPT_DIR, 'content-approval-bridge.js');
const PENDING_TEXT_REPLY_PATH = path.join(SCRIPT_DIR, 'outputs', 'seo-strategist', 'pending-text-reply.json');

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
    allowed_updates: ['callback_query', 'message'],
  });
}

async function answerCallbackQuery(callbackQueryId, text) {
  return telegramRequest('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: false,
  });
}

// ── Content Bridge caller ─────────────────────────────────────────────────────

function callContentBridge(callbackData) {
  const nodeExe = process.execPath;
  log('info', `Calling content bridge: ${callbackData}`);
  try {
    const output = execFileSync(nodeExe, [CONTENT_BRIDGE_SCRIPT, '--callback', callbackData], {
      encoding: 'utf8',
      timeout: 120000,
    });
    log('info', 'Content bridge output: ' + output.trim());
    return { ok: true };
  } catch (err) {
    log('error', 'Content bridge failed', { message: err.message, stderr: err.stderr });
    return { ok: false, error: err.message };
  }
}

// ── Bridge caller ─────────────────────────────────────────────────────────────

function callBridge(callbackData, actor, notes) {
  const nodeExe = process.execPath;
  const args = notes !== undefined
    ? [BRIDGE_SCRIPT, callbackData, actor, notes]
    : [BRIDGE_SCRIPT, callbackData, actor];
  log('info', `Calling bridge: ${callbackData} actor=${actor}${notes !== undefined ? ' (with notes)' : ''}`);
  try {
    const output = execFileSync(nodeExe, args, {
      encoding: 'utf8',
      timeout: 15000,
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

  // Route content approval callbacks to content-approval-bridge
  if (CONTENT_ACTIONS.includes(action)) {
    log('info', `Content callback: action=${action} taskId=${entityId} from=${from}`);
    const result = callContentBridge(data);
    const replyText = result.ok
      ? action === 'content_approve' ? '✅ Approved! Publishing now...'
        : action === 'content_revise' ? '🔄 Revision queued.'
        : '❌ Rejected.'
      : '⚠️ Action failed. Check logs.';
    await answerCallbackQuery(id, replyText).catch(() => {});
    return;
  }

  if (!KNOWN_ACTIONS.includes(action) || !entityId) {
    log('info', `Ignoring unknown callback: ${data}`);
    await answerCallbackQuery(id, '').catch(() => {});
    return;
  }

  log('info', `Received callback: action=${action} entity=${entityId} from=${from}`);

  // Call the bridge immediately before answering (bridge is fast, < 100ms)
  const result = callBridge(data, from);

  // Answer the callback query (dismiss the loading spinner on the button)
  const replyText = result.ok
    ? action === 'approve'
      ? '✅ Approved! Post-approval pipeline starting.'
      : action === 'revise'
      ? '🔄 Please reply to the bot message with your notes.'
      : '❌ Please reply to the bot message with what went wrong.'
    : '⚠️ Action received but update failed. Check logs.';

  try {
    await answerCallbackQuery(id, replyText);
    log('info', `Answered callback ${id}`);
  } catch (err) {
    log('warn', `answerCallbackQuery failed (query may have expired): ${err.message}`);
  }
}

// ── Text message handler (for revision notes / escalation replies) ────────────

async function handleMessage(message) {
  const text = (message.text || '').trim();
  const from = message.from?.username || message.from?.first_name || String(message.from?.id);

  if (!text) return;

  // Only act if there's a pending text reply waiting
  let pending;
  try {
    pending = JSON.parse(fs.readFileSync(PENDING_TEXT_REPLY_PATH, 'utf8'));
  } catch (_) {
    log('info', `Ignoring text message (no pending reply): "${text.substring(0, 50)}"`);
    return;
  }

  // Validate this is actually a reply to the bot's force_reply message
  const replyToId = message.reply_to_message?.message_id;
  if (pending.force_reply_message_id && replyToId !== pending.force_reply_message_id) {
    log('info', `Ignoring message — not a reply to force_reply message ${pending.force_reply_message_id} (got reply_to=${replyToId})`);
    return;
  }

  const callbackData = `${pending.action}|${pending.sprint_id}`;
  log('info', `Routing text to bridge: action=${pending.action} sprint=${pending.sprint_id} text="${text.substring(0, 60)}"`);
  callBridge(callbackData, from, text);
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
        } else if (update.message?.text) {
          await handleMessage(update.message);
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
