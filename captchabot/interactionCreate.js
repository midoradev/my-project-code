const {
    EmbedBuilder,
    Collection,
    AttachmentBuilder,
    PermissionFlagsBits,
  } = require("discord.js");
  const ms = require("ms");
  const cooldowns = new Collection();
  const verify = require("../../utils/models/verify");
  const { Captcha } = require("captcha-canvas");
  
  module.exports = async (client, interaction) => {
    const settings = require("../../utils/models/settings");
    const lang = await settings.findOne({ guildId: interaction.guild.id });
    // const word = require(`./lang/${lang.language}.js`);
    const word = require(`../../utils/lang/vi.js`);
    if (interaction.isCommand()) {
      const command = client.interactions.get(interaction.commandName);
  
      if (!interaction.guild) return;
  
      if (!command)
        return interaction.reply({
          content: word.interactionCreate.errorCmd.replace(
            "<command>",
            interaction.commandName
          ),
          ephemeral: true,
        });
  
      if (!cooldowns.has(command.name))
        cooldowns.set(command.name, new Collection());
      const now = Date.now();
      const timestamps = cooldowns.get(command.name);
      const cooldownAmount = command.cooldown || 5000;
      if (timestamps.has(interaction.member.user.id)) {
        const expirationTime =
          timestamps.get(interaction.member.user.id) + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = Math.floor(expirationTime - now);
          return interaction.reply({
            content: word.interactionCreate.onCooldown
              .replace("<user>", interaction.user)
              .replace("<duration>", ms(timeLeft)),
            ephemeral: true,
          });
        }
      }
      if (
        !interaction.guild.members.me.permissions.has(
          PermissionFlagsBits.Administrator
        )
      )
        return interaction.reply({
          content: word.interactionCreate.permissionError,
          embeds: [embed],
          ephemeral: true,
        });
  
      try {
        command.run(client, interaction);
        timestamps.set(interaction.member.user.id, now);
        setTimeout(
          () => timestamps.delete(interaction.member.user.id),
          cooldownAmount
        );
      } catch (e) {
        interaction.reply({ content: e.message });
      }
    } else if (interaction.isButton()) {
      if (interaction.customId == "verify") {
        const data = await verify.findOne({ guildId: interaction.guild.id });
        if (!data) {
          return interaction.reply({
            content: word.verify.interaction.noData,
            ephemeral: true,
          });
        }
        const roles = data.roleId;
  
        const findRole = interaction.guild.roles.cache.get(roles);
        if (!findRole) return;
        if (interaction.member.roles.cache.has(findRole.id)) {
          return interaction.reply({
            content: word.verify.interaction.hasRole,
            ephemeral: true,
          });
        }
        interaction.reply({
          content: `${word.verify.interaction.checkVerify}`,
          ephemeral: true,
        });
  
        let embed = new EmbedBuilder()
          .setColor("#C2E8FF")
          .setImage(
            `https://media.discordapp.net/attachments/919752571315425291/1056774382745309224/image.png`
          );
        if (
          !interaction.guild.members.me.permissions.has(
            PermissionFlagsBits.Administrator
          )
        )
          return interaction.reply({
            content: `${word.verify.interaction.permissionError}`,
            embeds: [embed],
            ephemeral: true,
          });
  
        const captcha = new Captcha(600, 200, 8);
        captcha.addDecoy({ total: 20, size: 40 });
        captcha.drawCaptcha({ size: 40 });
        captcha.addDecoy();
        captcha.drawTrace();
        const captchaImg = new AttachmentBuilder(await captcha.png, {
          name: "captcha.png",
        });
        let cmsg = await interaction.user.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#C2E8FF")
              .setTitle(
                word.verify.interaction.embedTitle.replace(
                  "<server>",
                  interaction.guild.name
                )
              )
              .setDescription(word.verify.interaction.embedDescription)
              .setFooter({ text: word.verify.interaction.embedFooter })
              .setImage("attachment://captcha.png"),
          ],
          files: [captchaImg],
        });
        await cmsg.channel
          .awaitMessages({
            filter: (m) => m.author.id == interaction.user.id,
            max: 1,
            time: 1000 * 60,
            errors: ["time"],
          })
          .then(async (value) => {
            let isValid = value.first().content == captcha.text;
            if (isValid) {
              await interaction.member.roles
                .add(findRole)
                .catch((e) => console.error(e));
              interaction.user.send({
                content: word.verify.interaction.successVerify.replace(
                  "<server>",
                  interaction.guild.name
                ),
              });
            } else {
              await interaction.user.send(
                word.verify.interaction.failedSolve.replace(
                  "<server>",
                  interaction.guild.name
                )
              );
              interaction.member.kick().catch((e) => {});
            }
          })
          .catch(async (e) => {
            await interaction.user.send(
              word.verify.interaction.outTime.replace(
                "<server>",
                interaction.guild.name
              )
            );
            console.log(e);
            interaction.member.kick().catch((e) => {});
          });
      }
    }
  };
  