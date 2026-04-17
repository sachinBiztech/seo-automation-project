#!/bin/bash
LOG=/tmp/seo-pipeline.log
nohup node /home/sachin.p/.openclaw/workspace/seo-automation/run-pipeline.js --force "$@" > "$LOG" 2>&1 &
PID=$!
echo "SEO pipeline started (PID $PID). Log: $LOG"
echo "Check progress: tail -f $LOG"
