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

wakeUp(config.threshold.macAddress);







