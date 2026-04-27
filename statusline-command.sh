#!/bin/sh
# Claude Code status line — model, context bar, cost, session duration, reset
input=$(cat)

# --- 1. Model + effort ---
model_id=$(echo "$input" | jq -r '.model.id // empty')
# Shorten e.g. "claude-sonnet-4-6" → "sonnet-4-6"
short_model=$(echo "$model_id" | sed 's/^claude-//')
effort=$(echo "$input" | jq -r '.effort.level // empty')
if [ -n "$effort" ]; then
  model_part="$short_model $effort"
else
  model_part="$short_model"
fi

# --- 2. Colored context progress bar ---
used_pct=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
if [ -n "$used_pct" ]; then
  filled=$(awk -v p="$used_pct" 'BEGIN { v = int(p / 10 + 0.5); if (v > 10) v = 10; printf "%d", v }')
  empty=$((10 - filled))
  bar=""
  i=0
  while [ "$i" -lt "$filled" ]; do
    bar="${bar}█"
    i=$((i + 1))
  done
  i=0
  while [ "$i" -lt "$empty" ]; do
    bar="${bar}░"
    i=$((i + 1))
  done
  pct_int=$(printf "%.0f" "$used_pct")
  if [ "$pct_int" -le 60 ]; then
    color="\033[32m"   # green
  elif [ "$pct_int" -le 79 ]; then
    color="\033[33m"   # dark orange / yellow
  else
    color="\033[31m"   # red
  fi
  ctx_part=$(printf "${color}%s\033[0m %d%%" "$bar" "$pct_int")
else
  ctx_part="░░░░░░░░░░ --"
fi

# --- 3. Tier-aware estimated cost (USD) ---
# Rates per 1M tokens:
#   claude-haiku-4-5:  $0.80 input / $4.00 output / $0.08 cache_read
#   claude-sonnet-4-6: $3.00 input / $15.00 output / $0.30 cache_read
#   claude-opus-4-7:   $15.00 input / $75.00 output / $1.50 cache_read
in_tok=$(echo "$input" | jq -r '.context_window.total_input_tokens // 0')
out_tok=$(echo "$input" | jq -r '.context_window.total_output_tokens // 0')
cache_read=$(echo "$input" | jq -r '(.context_window.current_usage.cache_read_input_tokens) // 0')
case "$model_id" in
  claude-haiku-4-5)
    rate_in=0.80; rate_out=4.00; rate_cr=0.08 ;;
  claude-opus-4-7)
    rate_in=15.00; rate_out=75.00; rate_cr=1.50 ;;
  *)
    # default: sonnet-4-6 pricing
    rate_in=3.00; rate_out=15.00; rate_cr=0.30 ;;
esac
cost=$(awk -v i="$in_tok" -v o="$out_tok" -v cr="$cache_read" \
  -v ri="$rate_in" -v ro="$rate_out" -v rcr="$rate_cr" \
  'BEGIN { printf "%.2f", (i * ri + o * ro + cr * rcr) / 1000000 }')
cost_part="\$$cost"

# --- 4. Session duration (time since first message) ---
created_at=$(echo "$input" | jq -r '.session.created_at // empty')
if [ -n "$created_at" ]; then
  now=$(date +%s)
  elapsed=$((now - created_at))
  if [ "$elapsed" -lt 0 ]; then
    elapsed=0
  fi
  dur_hrs=$((elapsed / 3600))
  dur_mins=$(( (elapsed % 3600) / 60 ))
  if [ "$dur_hrs" -gt 0 ]; then
    dur_part=$(printf "%dh%dm" "$dur_hrs" "$dur_mins")
  else
    dur_part=$(printf "%dm" "$dur_mins")
  fi
else
  dur_part=""
fi

# --- 5. Session reset countdown (5-hour window) ---
resets_at=$(echo "$input" | jq -r '.rate_limits.five_hour.resets_at // empty')
if [ -n "$resets_at" ]; then
  now=$(date +%s)
  diff=$((resets_at - now))
  if [ "$diff" -le 0 ]; then
    reset_part="reset now"
  else
    hrs=$((diff / 3600))
    mins=$(( (diff % 3600) / 60 ))
    if [ "$hrs" -gt 0 ]; then
      reset_part=$(printf "reset in %dh%02dm" "$hrs" "$mins")
    else
      reset_part=$(printf "reset in %dm" "$mins")
    fi
  fi
else
  reset_part="reset --"
fi

# --- Assemble ---
# Format: sonnet-4-6 max | [colored bar] 42% | $0.18 | 42m | reset in 1h45m
if [ -n "$dur_part" ]; then
  printf "%s | %b | %s | %s | %s" "$model_part" "$ctx_part" "$cost_part" "$dur_part" "$reset_part"
else
  printf "%s | %b | %s | %s" "$model_part" "$ctx_part" "$cost_part" "$reset_part"
fi
