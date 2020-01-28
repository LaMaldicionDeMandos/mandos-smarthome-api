const _ = require('lodash');

const DB = require('./DB');
const Device = require('../models/device');

const persistConsume = (device, powerOn, powerOff) => {
    console.log("Persistiendo: " + JSON.stringify(device));
    const c = new DB.Consume();
    c._id = new DB.ObjectId();
    c.deviceId = device.id;
    c.name = device.name;
    c.power = parseFloat(device.power);
    c.powerOn = powerOn;
    c.powerOff = powerOff;
    console.log("Persiste consumo " + c);
    return c.saveAsync();
};

const managePowerDevice = (oldDevice, newDevice) => {
    if (newDevice.model !== Device.POW_R2_MODEL) return;
    if (newDevice.state === Device.ON_STATE) persistConsume(newDevice, !oldDevice || newDevice.state !== oldDevice.state, false);
    else if (oldDevice && newDevice.state !== oldDevice.state) persistConsume(newDevice, false, true);
};

class DevicesRepository {
    constructor(devicesService) {
        this.devicesService = devicesService;
        this.devices = [];
    }

    setDevices = (devices) => {
        this.devices = devices;
    };

    updateDevice = (_device) => {
        let device = _(this.devices).find({id: _device.id});
        managePowerDevice(device, _device);
        if (device) {
            console.log(`update device ${device.name} with state ${_device.state}`);
            device.state = _device.state || device.state;
            device.power = _device.power;
            device.voltage = _device.voltage;
            device.current = _device.current;
        } else {
            console.log(`New device ${_device.id}`);
            this.devicesService.getDevice(_device.id)
                .tap((device) => this.devices.push(device))
                .tap((device) => console.log(`Device: ${JSON.stringify(device)}`));
        }
    };
}

module.exports = DevicesRepository;
