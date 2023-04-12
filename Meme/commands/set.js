const model = require("../utils/model");
module.exports = {
  name: "set",
  aliases: ["st"],
  description: "Automatically post a meme in a channel",
  run: async (client, message, args) => {
    // Source from StarskyBot Discord verify command but rewrite :)
    let data = model.findOne({ server: message.serverId });
    if (!data) {
      const channel = message.mentions?.channels?.[0];
      if (!channel) return message.reply(`Please mention a channel first!`);
      await model.create({
        server: message.serverId,
        channel: channel.id,
      });
      return message.reply(
        `Successfully setup for this channel!\nNote: Re-run command to delete data for the server`
      );
    }
    message.reply(
      `This server is already setup! Please use \`,delete\` to delete data from this server`
    );
  },
};
