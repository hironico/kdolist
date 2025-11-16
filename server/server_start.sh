#!/bin/bash

CURRENT_DATE=$(date +"%Y%m%d-%H%M%S")

LOG_DIR="/var/log/sites/kdolist"

mkdir -p $LOG_DIR

LOG_FILE="$LOG_DIR/kdolit_$CURRENT_DATE.log"

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# ensure we change the current working directory to script dir
# so that node can find the config file
cd ${SCRIPT_DIR}

node ./src/index.js > $LOG_FILE 2>&1