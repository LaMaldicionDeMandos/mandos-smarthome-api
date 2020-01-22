const express = require('express');
const router = express.Router();
const devicesService = require('../services/ewelink.service');
var Promise = require("bluebird");
/* GET home page. */
router.get('/devices', function(req, res, next) {
  Promise.resolve(devicesService.getDevices()).map(device => {
    return {_id: device.deviceid, name: device.name, state: device.params.switch, power: device.params.power,
      voltage: device.params.voltage, current: device.params.current, model: device.productModel}})
      .then(devices => res.status(200).send(devices));
});

router.patch('/devices/:id', function(req, res, next) {
  const id = req.params.id;
  const state = req.body.state;
  devicesService.setDevicePowerState(id, state)
      .then(status => {
        if (status.status === 'ok') res.status(200).send(status.state);
        else res.status(500).send();
      });
});

module.exports = router;
