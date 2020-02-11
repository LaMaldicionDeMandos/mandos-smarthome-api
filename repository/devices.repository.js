const _ = require('lodash');

const DB = require('./DB');
const Device = require('../models/device');

const persistConsume = (device, powerOn, powerOff) => {
    console.log("Persistiendo: " + JSON.stringify(device));
    const c = new DB.Consume();

    c.deviceId = device.id;
    c.name = device.name;
    c.power = device.power ?  parseFloat(device.power) : 0;
    c.powerOn = powerOn;
    c.powerOff = powerOff;
    c._id = new DB.ObjectId();

    if (!powerOn && !powerOff) {
        DB.Consume.findOneAsync({deviceId: device.id}, {}, {sort: {date: -1}})
            .then((old) => {
                if (old.power === c.power && !old.powerOn && !old.powerOff) {
                    old.date = DB.now();
                    old.updateOneAsync({date: old.date});
                } else {
                    c.saveAsync();
                }
            });
    } else {
        console.log("Persiste consumo " + c);
        return c.saveAsync();
    }



};

const managePowerDevice = (oldDevice, newDevice) => {
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

    clearHistory = () => {
        let date = DB.now().subtract(2, 'months');
        return DB.Consume.deleteManyAsync({date: {'$lt': date}});
    };

    lastPowerEventQuery = (query, powerOnOff) => {
        const _query = query.name
            ? _.assign(query, {name: {'$regex': new RegExp(`^${query.name}$`, 'i')}})
            : query;
        return DB.Consume.findOneAsync(_.assign(_query, powerOnOff), {date: true}, {sort: { date: -1}});
    };

    lastPowerOn = (query) => {
        return this.lastPowerEventQuery(query, {powerOn: true});
    };
    lastPowerOff = (query) => {
        return this.lastPowerEventQuery(query, {powerOff: true});
    };
}

module.exports = DevicesRepository;
