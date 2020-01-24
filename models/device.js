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

module.exports = Device;
