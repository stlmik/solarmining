#!/bin/bash
(cd ~/apps/solarmining && node startMiningRemote.js)
ssh "stanislav.mikulecky@gmail.com"@192.168.1.61 'D:\source\solarmining\start.bat'
