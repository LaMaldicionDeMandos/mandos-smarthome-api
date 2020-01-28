class Device {
    constructor(ewelinkDevice) {
        this.id = ewelinkDevice.deviceid;
        this.name =  ewelinkDevice.name;
        this.state = ewelinkDevice.params.switch;
        this.power = ewelinkDevice.params.power;
        this.voltage =  ewelinkDevice.params.voltage;
        this.current = ewelinkDevice.params.current;
        this.model = ewelinkDevice.productModel;
    }
}

Device.BASIC_MODEL = 'Basic';
Device.BASIC2_MODEL = 'Basic2';
Device.POW_R2_MODEL = 'Pow_R2';

Device.ON_STATE = 'on';
Device.OFF_STATE = 'off';

module.exports = Device;
