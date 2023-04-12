const {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Get a random meme")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  /**
   *
   * @param {CommandInteraction} interaction
   */
  execute(interaction) {
    fetch(`https://meme-api.com/gimme`)
      .then((res) => res.json())
      .then(async (json) => {
        let embed = new EmbedBuilder()
          .setColor(0xc2e8ff)
          .setTitle(json.title)
          .setURL(json.postLink)
          .setImage(json.url)
          .setFooter({
            text: `From /r/${json.subreddit} | 👍 ${json.ups}`,
          });

        await interaction.reply({
          embeds: [embed],
        });
      });
  },
};
