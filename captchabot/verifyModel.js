const { Schema, model } = require("mongoose");

const verify = new Schema({
  guildId: String,
  roleId: String,
});

module.exports = model("verify", verify);
