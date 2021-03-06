const axios = require("axios");

var _vrmInstallId;
var _vrmBatteryId;

var _userName;
var _password;

exports.setCredentials = (username, password) => {
    _userName = username;
    _password = password;
}

exports.setVRMParams = (baseUrl, installId, batteryId) => {
    axios.defaults.baseURL = baseUrl;
    _vrmInstallId = installId;
    _vrmBatteryId = batteryId;
}


//VRM methods

// Logins to VRM and return login token
function loginToVRM() {
    return new Promise(function(resolve, reject) {
        axios.post('/auth/login', {
            username: _userName,
            password: _password
        }).then(function (response) {
            //console.log(response);
            resolve(response.data.token);
        }).catch(function (error) {
            reject(error);
        });
    });
}


function setBearerToken(token) {
    axios.defaults.headers.common['X-Authorization'] = "Bearer " + token;
}


// returns start timestamp of last full 15-minute (e.g. when run on 9.43 it will return timestamp of 9:15)
function getEnd15Minute(referenceDateTime) {
    var currentMins = referenceDateTime.getMinutes();
    var currentSecs = referenceDateTime.getSeconds();
    var deltaInSecs = (currentMins % 15)*60; // get number of seconds to last full 15 mins time (e.g. for 23 it will be 8*60)
    var last15MinsEnd = Math.floor(referenceDateTime.getTime() / 1000) - deltaInSecs - currentSecs + 1;
    return last15MinsEnd;
}

// returns the average amount of power  generated for past x  minutes by victron on address
function getSunshineLevel(minutes) {
    var last15MinsEnd = getEnd15Minute(new Date());
    var last15MinsStart = last15MinsEnd - minutes*60 - 2;
    return new Promise(function(resolve, reject) {
        //TODO add timestamps for 15-mins
        var url = '/installations/' + _vrmInstallId + '/stats?start=' + last15MinsStart +'&end=' + last15MinsEnd + '&interval=15mins&type=solar_yield';
        //console.log(url);
        axios.get(url)
            .then(function (response) {
                //console.log(response.data);
                resolve(response.data.totals.Pb + response.data.totals.Pc);
            })
            .catch(function (error) {
                reject(error);
            });
    });
}

// gets battery percentage for victron on given address
function getBatteryLevel() {
    return new Promise(function(resolve, reject) {
        axios.get('/installations/' + _vrmInstallId + '/widgets/BatterySummary?instance=' + _vrmBatteryId)
            .then(function (response) {
                //console.log(response.data.records.data['51'].value);
                resolve(response.data.records.data['51'].value);
            })
            .catch(function (error) {
                reject(error);
            });
    });
}

exports.isMiningStartConditionMet = (minSunshine, minBattery) => {

    var authToken;
    var batteryLevel;
    var sunshineLevel;
    var resultFlag = false;

    return loginToVRM().then(
        result => {
            authToken=result;
            //console.log("Setting the token");
            setBearerToken(authToken);
            return getBatteryLevel();
        }
    ).then(result => {
        batteryLevel = result;
        return getSunshineLevel(15);
    }).then(result => {
            sunshineLevel = result;
            console.log("BatteryLevel: " + batteryLevel + " Sunshine Level: " + sunshineLevel);
            //find out whether to start mining = 200Wh power yield in last 15mins or battery > 75%
            if (sunshineLevel > minSunshine || (batteryLevel > minBattery && sunshineLevel > 0.01)) {
                //wake up the computer
                //console.log("Condition met...")
                return true;
            }
            return false;
        }
    );

}