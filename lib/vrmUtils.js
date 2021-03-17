const axios = require("axios");

const VRM_BASE_URL = "https://vrmapi.victronenergy.com/v2";
const VRM_INSTALLID = 60529;
const VRM_BATTERYID = 512;

axios.defaults.baseURL = VRM_BASE_URL;

var _userName;
var _password;

exports.setCredentials = (username, password) => {
    _userName = username;
    _password = password;
}


//VRM methods

// Logins to VRM and return login token
function loginToVRM() {
    return new Promise(function(resolve, reject) {
        axios.post('/auth/login', {
            //TODO remove credentials
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


// returns the average amount of power  generated for past x  minutes by victron on address
function getSunshineLevel(minutes) {
    var currentDate = new Date();
    var currentMins = currentDate.getMinutes();
    var deltaInSecs = (currentMins % 15)*60; // get end of last 15-min
    var currentSecs = Math.floor(currentDate / 1000) - deltaInSecs;
    var pastSecs = currentSecs - minutes*60;
    return new Promise(function(resolve, reject) {
        //TODO add timestamps for 15-mins
        var url = '/installations/' + VRM_INSTALLID + '/stats?start=' + pastSecs +'&end=' + currentSecs + '&interval=15mins&type=solar_yield';
        console.log(url);
        axios.get(url)
            .then(function (response) {
                console.log(response.data);
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
        axios.get('/installations/' + VRM_INSTALLID + '/widgets/BatterySummary?instance=' + VRM_BATTERYID)
            .then(function (response) {
                console.log(response.data.records.data['51'].value);
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
            console.log("Setting the token");
            setBearerToken(authToken);
            return getBatteryLevel();
        }
    ).then(result => {
        batteryLevel = result;
        return getSunshineLevel(15);
    }).then(result => {
            sunshineLevel = result;
            console.log("BatteryLevel: " + batteryLevel + " Sunshine Level: " + sunshineLevel);
            //find out whether to start mining = 200kWh power yield in last 15mins or battery > 75%
            if (sunshineLevel > minSunshine || batteryLevel > minBattery) {
                //wake up the computer
                console.log("Condition met...")
                return true;
            }
            return false;
        }
    );

}