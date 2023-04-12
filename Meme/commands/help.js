const { Embed } = require("guilded.js");

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "List all commands",
  run: async (client, message, args) => {
    const embed = new Embed()
      .setTitle(`${client.user.name}'s Commands`)
      .setThumbnail(client.user.avatar)
      .setFooter(`© midora`)
      .setTimestamp()
      .setColor([231, 229, 229]);
      client.commands.forEach((cmd) => {
        embed.addField(`${client.prefix}${cmd.name} (${cmd.aliases})`, `${cmd.description}`, true)
      });
    message.reply(embed);
  },
};
