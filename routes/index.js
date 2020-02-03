const express = require('express');
const router = express.Router();
const devicesService = require('../services/ewelink.service');
const DevicesRepository = require('../repository/devices.repository');

const devicesRepo = new DevicesRepository(devicesService);

/* GET home page. */
router.get('/devices', (req, res) => {
  devicesService.getDevices().then(devices => res.status(200).send(devices));
});

router.patch('/devices/:id', (req, res) => {
  const id = req.params.id;
  const state = req.body.state;
  devicesService.setDevicePowerState(id, state)
      .then(status => {
        if (status.status === 'ok') res.status(200).send(status.state);
        else res.status(500).send();
      });
});

router.post('/devices/monitor/event', (req, res) => {
    devicesService.monitor().then(() => res.status(201).send({ok: 'ok'}));
});

router.delete('/devices/monitor/event', (req, res) => {
    devicesRepo.clearHistory().then(() => res.status(200).send({ok: 'ok'}));
});

module.exports = router;
