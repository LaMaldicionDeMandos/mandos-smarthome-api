const express = require('express');
const router = express.Router();
const devicesService = require('../services/ewelink.service');

/* GET home page. */
router.get('/devices', function(req, res, next) {
  devicesService.getDevices().then(devices => res.status(200).send(devices));
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
