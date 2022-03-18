//Script is periodically executed on mining machine and controls the mining execution (start, stop) based on conditions
const vrmUtils = require("./lib/vrmUtils");
const ps = require('ps-node');
const { exec } = require("child_process");
var config = require('./config');



vrmUtils.setCredentials(config.vrm.username, config.vrm.password);
vrmUtils.setVRMParams(config.vrm.baseUrl, config.vrm.installId, config.vrm.batteryId);


function checkMiningRunning(shallMine) {

    ps.lookup({
        command: config.miner.processName,
    }, function(err, resultList ) {
        if (err) {
            throw new Error( err );
        }
        if (resultList.length <= 0) {
            console.log("Miner NOT found");
            if (shallMine) {
                startMining();
            }
        } else {
            console.log("Miner found");
            if (!shallMine) {
                stopMining(resultList);
            }
        }
    });
}

function startMining() {
    console.log("Starting miner...");
    exec(config.miner.startBatchName, (error, stdout, stderr) => {
        if (error) {
            //console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            //console.log(`stderr: ${stderr}`);
            return;
        }
        //console.log(`stdout: ${stdout}`);
    });

}

function stopMining(processes) {
    console.log("Stopping miner...");

    processes.forEach(function (process) {
        console.log('Killing PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments);
        if (process) {
            ps.kill( process.pid, function( err ) {
                if (err) {
                    throw new Error( err );
                    console.log( 'Cannot kill process %s!', process.pid );
                }
                else {
                    console.log( 'Process %s has been killed!', process.pid );
                }
            });
        }
    });

}

function testTest() {
    return 1;
}

//check if the rig shall be mining and start/stop it if necessary
vrmUtils.isMiningStartConditionMet(config.threshold.sunshineYieldKw, config.threshold.minBatteryStartMine).then(shallMine => {
      checkMiningRunning(shallMine);
  }
)

