const ewelink = require('ewelink-api');
const DevicesRepository = require('../repository/devices.repository');
const Device = require('../models/device');
const Promise = require("bluebird");

const LOGIN = {
    email: process.env.EWELINK_EMAIL,
    password: process.env.EWELINK_PASS,
    region: 'us'
};

const connect = () => new ewelink(LOGIN);

var connection = connect();

var credentials;
var socket;

connection.getCredentials()
    .then((_credentials) => credentials = _credentials)
    .then(() => connection.openWebSocket(analyzeEvent))
    .then((_socket) => socket = _socket)
    .catch(e => _reconnect());

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
        return this.getDevices().then(devices =>
                devices.forEach(
                    device => this.getDevice(device.id)
                        .tap((device) => {
                            if (device.state === Device.ON_STATE && device.model === Device.POW_R2_MODEL && parseFloat(device.power) === 0) {
                                console.log("Device power = 0, try to reconnect");
                                this.reconnect();
                            }
                        })
                        .then(devicesRepository.updateDevice))
        );
    }

    setDevicePowerState(id, state) {
        return this.connection.setDevicePowerState(id, state);
    }

    reconnect() {
        if (!process.env.RECONNECT) return;
        socket.close();
        this.connection = connect();
        this.connection.getCredentials()
            .then((_credentials) => credentials = _credentials)
            .then(() => this.connection.openWebSocket(analyzeEvent))
            .then((_socket) => socket = _socket);
    }
}

const devicesService = new DevicesService();
const devicesRepository = new DevicesRepository(devicesService);

function _reconnect() {
    devicesService.reconnect();
}

function analyzeEvent(data) {
    if (data.action === 'update' && data.params && data.params.switch) {
        devicesService.getDevice(data.deviceid).then(devicesRepository.updateDevice);
    }
}
/* get all devices */
module.exports = devicesService;
