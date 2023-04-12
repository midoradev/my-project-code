const Discord = require("discord.js");
const client = new Discord.Client({
  intents: 3276799,
  shards: "auto",
  partials: [
    Discord.Partials.Channel,
    Discord.Partials.Message,
    Discord.Partials.User,
    Discord.Partials.GuildMember,
    Discord.Partials.Reaction,
  ],
});
require("dotenv").config();
client.slashCommands = new Discord.Collection();
client.userSettings = new Discord.Collection();
const config = require("./config.json");
client.config = config;

module.exports = client;

["slashCommand", "events"].forEach((handler) => {
  require(`./handlers/${handler}`)(client);
});

process.on("unhandledRejection", (reason, p) => {
  console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
  console.log(err, origin);
});

client
  .login(process.env.TOKEN)
  .catch((err) => console.error(`❌ | Failed to login! \n${err}`));
