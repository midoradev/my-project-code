require('dotenv').config()
let config = require('../config.json')
const mongoose = require('mongoose');
const mongodb = process.env.MONGO_URL;

module.exports = async (client) => {
    client.user.setActivity(config.defaults.statusMessage, { type: config.defaults.statusType })
    console.log('\x1b[33m%s\x1b[0m', 'Online 🟢');

    if(!mongodb) return;
    mongoose.connect(mongodb, {
      useNewUrlParser: true,
      useUnifiedTopology: false
    }).then(() => {
      console.log("Connected to database!")
    }).catch((err) => {
      console.log(err)
    })
};