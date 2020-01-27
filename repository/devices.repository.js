const _ = require('lodash');

const DB = require('./DB');
const Device = require('../models/device');

const DEVICE_POWER_SENSE_INTERVAL = 1000*60;

var intervals = {};

const persistConsume = (device, powerOn, powerOff) => {
    const c = new DB.Consume();
    c._id = new DB.ObjectId();
    c.deviceId = device.id;
    c.name = device.name;
    c.power = parseFloat(device.power);
    c.powerOn = powerOn;
    c.powerOff = powerOff;
    return c.saveAsync();
};

const managePowerDevice = (device, deviceService) => {
    if (device.model === 'Pow_R2') {
        if (device.state === 'on' && !intervals[device.id]) {
            persistConsume(device, true, false);
            intervals[device.id] = setInterval(() => {
                console.log("search device power");
                deviceService.getDevice(device.id)
                    .then(device => {
                        console.log(`Device power: ${device.power}`);
                        return device;
                    })
                    .then(device => {
                        persistConsume(device, false, false).then(() => consume);
                    })
                    .catch((err) => console.log(err));
            }, DEVICE_POWER_SENSE_INTERVAL);
        } else {
            persistConsume(device, false, true);
            const interval = intervals[device.id];
            if (interval) {
                clearInterval(interval);
                delete intervals[device.id];
            }
        }
    }
};

class DevicesRepository {
    constructor(devicesService) {
        this.devicesService = devicesService;
        this.devices = [];
    }

    setDevices = (devices) => {
        this.devices = devices;
    };

    updateDevice = (data) => {
        let device = _(this.devices).find({id: data.id});
        let deviceP;
        if (device) {
            console.log(`update device ${device.name} with state ${data.params.switch}`);
            device.state = data.params.switch || device.state;
        } else {
            console.log(`New device ${data.id}`);
            deviceP = this.devicesService.getDevice(data.id)
                .tap((device) => this.devices.push(device))
                .tap((device) => console.log(`Device: ${JSON.stringify(device)}`));
        }

        deviceP = device ? Promise.resolve(device) : deviceP;
        deviceP.then(device => managePowerDevice(device, this.devicesService));
    };
}

module.exports = DevicesRepository;
