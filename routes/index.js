const express = require('express');
const router = express.Router();
const devicesService = require('../services/ewelink.service');
var Promise = require("bluebird");
/* GET home page. */
router.get('/devices', function(req, res, next) {
  Promise.resolve(devicesService.getDevices()).map(device => {
    return {_id: device._id, name: device.name, state: device.params.switch, power: device.params.power,
      voltage: device.params.voltage, current: device.params.current, model: device.productModel}})
      .then(devices => res.status(200).send(devices));
});

module.exports = router;
