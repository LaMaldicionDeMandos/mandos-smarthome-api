var Promise = require('bluebird');
const mongoose = require('mongoose');

Promise.promisifyAll( mongoose );

const Schema = mongoose.Schema;

const ConsumeSchema = new Schema({
    _id:String,
    deviceId:String,
    name:String,
    power:Number,
    date:{type:Date, default:Date.now},
    powerOn:{type:Boolean, default: false},
    powerOff:{type:Boolean, default: false}});
const Consume = mongoose.model('Consume', ConsumeSchema);

const db = new function() {
    mongoose.connect(process.env.MONGODB_URI);
    var Schema = mongoose.Schema;
    console.log('Connecting to mongodb');
    this.mongoose = mongoose;
    this.Schema = Schema;
    this.ObjectId = mongoose.Types.ObjectId;
    this.Consume = Consume;
};

process.on('exit', function() {
    console.log('Desconnecting db');
    mongoose.disconnect();
});

module.exports = db;
