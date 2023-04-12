const client = require("../index");
const Discord = require("discord.js");

client.on("ready", () => {
  console.log(`✅ | Bot is online! Logged in as`, client.user.tag);
  client.user.setStatus("dnd");

  client.user.setActivity("crypto | /crypto", {
    type: Discord.ActivityType.Watching,
  });
});