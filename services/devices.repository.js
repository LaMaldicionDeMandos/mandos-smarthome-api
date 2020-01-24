const _ = require('lodash');
const Device = require('../models/device');

class DevicesRepository {
    constructor(devicesService) {
        this.devicesService = devicesService;
        this.devices = [];
    }

    setDevices = (devices) => {
        this.devices = devices;
    };

    updateDevice = (data) => {
        const device = _(this.devices).find({id: data.id});
        if (device) {
            console.log(`update device ${device.name} with state ${data.params.switch}`);
            device.state = data.params.switch || device.state;
        } else {
            console.log(`New device ${data.id}`);
            this.devicesService.getDevice(data.id)
                .tap((device) => this.devices.push(device))
                .then((device) => console.log(device));
        }
    };
}

module.exports = DevicesRepository;
