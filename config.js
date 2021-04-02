var config = {
    vrm: {
        username: ' ',
        password: ' ',
        baseUrl: 'https://vrmapi.victronenergy.com/v2',
        installId: ' ',
        batteryId: ' '
    },
    miner: {
        processName: 't-rex',
        startBatchName: 'startMiner.bat',
        macAddress: ' '
    },
    threshold: {
        minBatteryPowerOn: 75,
        minBatteryStartMine: 85,
        sunshineYieldKw: 0.2
    }
};
module.exports = config;