const {
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonStyle,
    ButtonBuilder,
  } = require("discord.js");
  const verify = require("../utils/models/verify");
  
  module.exports = {
    name: "verify",
    description: "Verification System",
    options: [
      {
        name: `setup`,
        description: `Setup server verification system`,
        type: 1,
        options: [
          {
            name: "role",
            description: `Set a verified role`,
            type: 8,
            required: true,
          },
          {
            name: "title",
            description: `Title for verification embed`,
            type: 3,
            required: false,
          },
          {
            name: "description",
            description: `Description for verification embed`,
            type: 3,
            required: false,
          },
          {
            name: "channel",
            description: `Send verification embed in this channel`,
            type: 7,
            channelTypes: [0],
            required: false,
          },
        ],
      },
      {
        name: `delete`,
        description: `Delete all verification system data from the server`,
        type: 1,
      },
    ],
  
    run: async (client, interaction) => {
      const settings = require('../utils/models/settings')
      const lang = await settings.findOne({ guildId: interaction.guild.id })
      // const word = require(`./lang/${lang.language}.js`);
      const word = require(`../utils/lang/vi.js`);
      if (
        !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
      ) {
        return interaction.reply({
          content: `${word.verify.verifyCmd.permissionError}`,
          ephemeral: true,
        });
      }
      const options = interaction.options.getSubcommand();
      if (options === "setup") {
        const role = interaction.options.getRole("role");
        const channel =
          interaction.options.getChannel("channel") || interaction.channel;
        const title = interaction.options.getString("title");
        const description = interaction.options.getString("description");
        const verifyEmbed = new EmbedBuilder()
          .setTitle(title || `Welcome to ${interaction.guild.name}`)
          .setDescription(
            description ||
              "Please authorize yourself by clicking on the '🤖 Verify' button below"
          )
          .setColor(0xc2e8ff);
        const data = await verify.findOne({ guildId: interaction.guild.id });
        if (!data) {
          await verify.create({
            guildId: interaction.guild.id,
            roleId: role.id,
          });
          let sendChannel = channel.send({
            embeds: [verifyEmbed],
            components: [
              new ActionRowBuilder().setComponents(
                new ButtonBuilder()
                  .setCustomId("verify")
                  .setLabel("Verify")
                  .setEmoji("🤖")
                  .setStyle(ButtonStyle.Success)
              ),
            ],
          });
          if (!sendChannel) {
            return interaction.reply({
              content: `${word.verify.verifyCmd.errorChannel}`,
              ephemeral: true,
            });
          }
          return interaction.reply({
            content: `${word.verify.verifyCmd.successSend}`,
            ephemeral: true,
          });
        }
        interaction.reply({
          content: `${word.verify.verifyCmd.isData}`,
          ephemeral: true,
        });
      } else if (options === "delete") {
        const data = await verify.findOneAndDelete({
          guildId: interaction.guild.id,
        });
        if (!data) {
          return interaction.reply({
            content: word.verify.verifyCmd.noData,
            ephemeral: true,
          });
        }
        interaction.reply({
          content: word.verify.verifyCmd.successDetele.replace("<server>", interaction.guild.name) , 
          ephemeral: true,
        });
      }
    },
  };
  