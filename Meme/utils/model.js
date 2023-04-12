const { Schema, model } = require("mongoose");

const models = new Schema({
  server: String,
  channel: String,
});

module.exports = model("model", models);
