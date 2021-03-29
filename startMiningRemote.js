const wol = require('wake_on_lan');
const vrmUtils = require("./lib/vrmUtils");
var config = require('./config');

// WOL methods

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


vrmUtils.isMiningStartConditionMet(0.2, 55).then(result => {
        if (result) {
            console.log("STARTING miner...")
            wakeUp('2C:F0:5D:A9:13:67');
        } else {
            console.log("NOT yet starting miner...");
        }
    }
)






