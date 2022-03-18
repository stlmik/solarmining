const vrmUtils = require('../lib/vrmUtils')
var config = require('../config.local');


test('setCredentials()', () => {
  userName = "name";
  password = "pwd";
  vrmUtils.setCredentials(userName, password);
  expect(vrmUtils.getUserName()).toBe(userName);
  expect(vrmUtils.getPassword()).toBe(password);

});

test('setVRMParams()', () => {
  baseUrl = "baseUrl";
  installId = "id1";
  batteryId = "id2";
  vrmUtils.setVRMParams(baseUrl, installId, batteryId);
  expect(vrmUtils.getBaseUrl()).toBe(baseUrl);
  expect(vrmUtils.getInstallId()).toBe(installId);
  expect(vrmUtils.getBatteryId()).toBe(batteryId);

});

test('isStartConditionMet', () => {
  vrmUtils.setCredentials(config.vrm.username, config.vrm.password);
  vrmUtils.setVRMParams(config.vrm.baseUrl, config.vrm.installId, config.vrm.batteryId);

  return vrmUtils.isMiningStartConditionMet(10, 100).then(
    result => { expect(result).toBe(false); }
  );

});

test('getBatteryLevel', () => {
  vrmUtils.setCredentials(config.vrm.username, config.vrm.password);
  vrmUtils.setVRMParams(config.vrm.baseUrl, config.vrm.installId, config.vrm.batteryId);

  return vrmUtils.getBatteryLevel().then(
    result => { expect(result).toBeGreaterThanOrEqual(0); }
  );

});

test('getSunshineLevel', () => {
  vrmUtils.setCredentials(config.vrm.username, config.vrm.password);
  vrmUtils.setVRMParams(config.vrm.baseUrl, config.vrm.installId, config.vrm.batteryId);

  return vrmUtils.getSunshineLevel(15).then(
    result => { expect(result).toBeGreaterThanOrEqual(0); }
  );

});

test('loginToVRM', () => {
  vrmUtils.setCredentials(config.vrm.username, config.vrm.password);

  return vrmUtils.loginToVRM(15).then(
    result => { expect(result).toBeDefined(); }
  );

});


