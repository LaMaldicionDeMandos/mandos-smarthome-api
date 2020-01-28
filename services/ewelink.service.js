const ewelink = require('ewelink-api');
const DevicesRepository = require('../repository/devices.repository');
const Device = require('../models/device');
const Promise = require("bluebird");

const connection = new ewelink({
    email: process.env.EWELINK_EMAIL,
    password: process.env.EWELINK_PASS,
    region: 'us'
});

var credentials;
var socket;

connection.getCredentials()
    .then((_credentials) => credentials = _credentials)
    .then(() => connection.openWebSocket(analyzeEvent))
    .then((_socket) => socket = _socket);

class DevicesService {
    constructor() {
        this.connection = connection;
    }

    getDevices() {
        return Promise.resolve(this.connection.getDevices()).map(device => new Device(device))
            .tap(devicesRepository.setDevices);
    }

    getDevice(id) {
        return Promise.resolve(this.connection.getDevice(id)).then(device => new Device(device));
    }

    monitor() {
        console.log("Comienzo monitoreo");
        this.getDevices().then(devices => devices.forEach(device => devicesRepository.updateDevice(device)));
    }

    setDevicePowerState(id, state) {
        return this.connection.setDevicePowerState(id, state);
    }
}

const devicesService = new DevicesService();
const devicesRepository = new DevicesRepository(devicesService);

const analyzeEvent = (data) => {
    if (data.action === 'update' && data.params && data.params.switch) {
        devicesRepository.updateDevice(devicesService.getDevice(data.deviceid));
    }
}
/* get all devices */
module.exports = devicesService;
