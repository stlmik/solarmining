const wol = require('wake_on_lan');
const vrmUtils = require("./lib/vrmUtils");
var config = require('./config');


//wakes up the computer with given mac address
function wakeUp(macAddr) {
    wol.wake(macAddr, function (error) {
        if (error) {
            console.log("Wake error!");
        } else {
            console.log("Wake success");
        }
    });

    var magic_packet = wol.createMagicPacket(macAddr);
}

vrmUtils.setCredentials(config.vrm.username, config.vrm.password);
vrmUtils.setVRMParams(config.vrm.baseUrl, config.vrm.installId, config.vrm.batteryId);

vrmUtils.isMiningStartConditionMet(config.threshold.sunshineYieldKw, config.threshold.minBatteryPowerOn).then(result => {
        if (result) {
            console.log("STARTING miner...")
            wakeUp(config.threshold.macAddress);
        } else {
            console.log("NOT yet starting miner...");
        }
    }
)






