const ewelink = require('ewelink-api');

const connection = new ewelink({
    email: process.env.EWELINK_EMAIL,
    password: process.env.EWELINK_PASS,
    region: 'us'
});

/* get all devices */
module.exports = connection;
