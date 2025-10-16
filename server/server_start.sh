#!/bin/bash

CURRENT_DATE=$(date +"%Y%m%d-%H%M%S")

LOG_FILE="/var/log/sites/kdolist/kdolit_$CURRENT_DATE.log"

nohup node ./src/index.js > $LOG_FILE 2>&1 &

PID=$!

echo $PID > server.pid

echo "Server started with PID: $PID. Updated server.pid file."