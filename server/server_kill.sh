#!/bin/bash

PID=`netstat -antp 2>/dev/null | grep LISTEN | grep 9090 | tr -s ' ' ' ' | cut -d ' ' -f 7 | cut -d '/' -f 1` 

kill -9 $PID

if [ $? -eq 0 ]
then
    echo "Server killed."
else 
    echo "No server process found for KDOList."
fi