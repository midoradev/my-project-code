const model = require("../utils/model");
module.exports = {
  name: "delete",
  aliases: ["del"],
  description: "Delete automeme data from this server",
  run: async (client, message, args) => {
    // Source from StarskyBot Discord verify command
    let data = await model.findOneAndDelete({ server: message.serverId });
    if (!data)
      return message.reply(
        `This server is not setup yet! Please use \`,set\` to setup automeme`
      );
    message.reply(`Successfully delete data from this server!`);
  },
};
