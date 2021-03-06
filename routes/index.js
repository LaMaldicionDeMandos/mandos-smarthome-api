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
    devicesService.monitor()
        .then(() => res.status(201).send({ok: 'ok'}))
        .catch((e) => {
            console.log(e);
            devicesService.reconnect();
            res.status(500).send(e);
        })
});

router.delete('/devices/monitor/event', (req, res) => {
    devicesRepo.clearHistory().then(() => res.status(200).send({ok: 'ok'}));
});

router.get('/devices/monitor/event/on', (req, res) => {
    devicesRepo.lastPowerOn(req.query).then((date) => res.status(200).send(date));
});

router.get('/devices/monitor/event/off', (req, res) => {
    devicesRepo.lastPowerOff(req.query).then((date) => res.status(200).send(date));
});

module.exports = router;
