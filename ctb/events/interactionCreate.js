const { EmbedBuilder, Collection, PermissionsBitField } = require("discord.js");
const ms = require('ms');
const client = require("../index");
const config = require("../config.json");

const cooldown = new Collection();

client.on("interactionCreate", async (interaction) => {
  const slashCommand = client.slashCommands.get(interaction.commandName);
  if (interaction.type == 4) {
    if (slashCommand.autocomplete) {
      const choices = [];
      await slashCommand.autocomplete(interaction, choices);
    }
  }
  if (!interaction.type == 2) return;

  if (!slashCommand)
    return client.slashCommands.delete(interaction.commandName);
  try {
    if (slashCommand.cooldown) {
      if (cooldown.has(`slash-${slashCommand.name}${interaction.user.id}`))
        return interaction.reply({
          content: config.messages["COOLDOWN_MESSAGE"]
            .replace(
              "<duration>",
              ms(
                cooldown.get(
                  `slash-${slashCommand.name}${interaction.user.id}`
                ) - Date.now(),
                { long: true }
              )
            )
            .replace("<user>", interaction.user),
          ephemeral: true,
        });
      if (slashCommand.userPerms || slashCommand.botPerms) {
        if (
          !interaction.memberPermissions.has(
            PermissionsBitField.resolve(slashCommand.userPerms || [])
          )
        ) {
          const userPerms = new EmbedBuilder()
            .setDescription(
              `You don't have \`${slashCommand.userPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return interaction.reply({
            content: `Hey ${interaction.user} !`,
            embeds: [userPerms],
            ephemeral: true,
          });
        }
        if (
          !interaction.guild.members.cache
            .get(client.user.id)
            .permissions.has(
              PermissionsBitField.resolve(slashCommand.botPerms || [])
            )
        ) {
          const botPerms = new EmbedBuilder()
            .setDescription(
              `I don't have \`${slashCommand.botPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return interaction.reply({
            content: `Hey ${interaction.user} !`,
            embeds: [botPerms],
            ephemeral: true,
          });
        }
      }

      await slashCommand.run(client, interaction);
      cooldown.set(
        `slash-${slashCommand.name}${interaction.user.id}`,
        Date.now() + slashCommand.cooldown
      );
      setTimeout(() => {
        cooldown.delete(`slash-${slashCommand.name}${interaction.user.id}`);
      }, slashCommand.cooldown);
    } else {
      if (slashCommand.userPerms || slashCommand.botPerms) {
        if (
          !interaction.memberPermissions.has(
            PermissionsBitField.resolve(slashCommand.userPerms || [])
          )
        ) {
          const userPerms = new EmbedBuilder()
            .setDescription(
              `You don't have \`${slashCommand.userPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return interaction.reply({
            content: `Hey ${interaction.user} !`,
            embeds: [userPerms],
            ephemeral: true,
          });
        }
        if (
          !interaction.guild.members.cache
            .get(client.user.id)
            .permissions.has(
              PermissionsBitField.resolve(slashCommand.botPerms || [])
            )
        ) {
          const botPerms = new EmbedBuilder()
            .setDescription(
              `I don't have \`${slashCommand.botPerms}\` permissions to use this command!`
            )
            .setColor("Red");
          return interaction.reply({
            content: `Hey ${interaction.user} !`,
            embeds: [botPerms],
            ephemeral: true,
          });
        }
      }
      await slashCommand.run(client, interaction);
    }
  } catch (error) {
    console.log(error);
  }
});