const axios = require("axios");

var _vrmInstallId;
var _vrmBatteryId;

var _userName;
var _password;

exports.setCredentials = (username, password) => {
    _userName = username;
    _password = password;
}

exports.getUserName = () => {
    return _userName;
}

exports.getPassword= () => {
    return _password;
}

exports.setVRMParams = (baseUrl, installId, batteryId) => {
    axios.defaults.baseURL = baseUrl;
    _vrmInstallId = installId;
    _vrmBatteryId = batteryId;
}

exports.getBaseUrl= () => {
    return axios.defaults.baseURL;
}

exports.getInstallId = () => {
    return _vrmInstallId;
}

exports.getBatteryId = () => {
    return _vrmBatteryId;
}


//VRM methods

// Logins to VRM and return login token
async function loginToVRM() {
    return axios.post('/auth/login', {
        username: _userName,
        password: _password
    }).then(function (response) {
        //console.log(response);
        return response.data.token;
    }).catch(function (error) {
        console.log("Error: " + error);
        return error;
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
async function getSunshineLevel(minutes) {
    let last15MinsEnd = getEnd15Minute(new Date());
    let last15MinsStart = last15MinsEnd - minutes*60 - 2;
    //TODO add timestamps for 15-mins
    let url = '/installations/' + _vrmInstallId + '/stats?start=' + last15MinsStart +'&end=' + last15MinsEnd + '&interval=15mins&type=solar_yield';
    //console.log(url);
    return axios.get(url)
      .then(function (response) {
          //console.log(response.data);
          return (response.data.totals.Pb + response.data.totals.Pc);
            })
      .catch(function (error) {
          console.log("Error:" + error);
          return error;
      });

}

// gets battery percentage for victron on given address
async function getBatteryLevel() {
    return axios.get('/installations/' + _vrmInstallId + '/widgets/BatterySummary?instance=' + _vrmBatteryId)
      .then(function (response) {
        //console.log(response.data.records.data['51'].value);
        return parseInt(response.data.records.data['51'].value);
      })
      .catch(function (error) {
          console.log("Error: " + error);
          return error;
      });
}

async function isMiningStartConditionMet(minSunshine, minBattery) {

    let authToken;
    let batteryLevel;
    let sunshineLevel;

    return loginToVRM().then(
        result => {
            authToken=result;
            console.log("Setting the token");
            setBearerToken(authToken);
            return getBatteryLevel();
        }
    ).then(result => {
        batteryLevel = result;
        console.log("Setting battery level");
        return getSunshineLevel(15);
    }).then(result => {
            sunshineLevel = result;
            console.log("BatteryLevel: " + batteryLevel + " Sunshine Level: " + sunshineLevel);
            //find out whether to start mining = 200Wh power yield in last 15mins or battery > 75%
            if (sunshineLevel > minSunshine || (batteryLevel > minBattery && sunshineLevel > 0.01)) {
                //wake up the computer
                console.log("Condition met...")
                return true;
            }
            return false;
        }
    ).catch(error => {
        console.log("Error: " + error);
    });

}

module.exports.isMiningStartConditionMet = isMiningStartConditionMet;
module.exports.getBatteryLevel = getBatteryLevel;
module.exports.getSunshineLevel = getSunshineLevel;
module.exports.loginToVRM = loginToVRM;