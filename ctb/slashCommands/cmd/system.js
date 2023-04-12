const {
  EmbedBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const os = require("os");

module.exports = {
  name: "system",
  description: "No Description",
  options: [
    {
      name: "string_options",
      description: "No Description",
      type: 3,
      choices: [
        { name: "leave", value: "leave" },
        { name: "evaluate", value: "evaluate" },
        { name: "status", value: "status" },
        { name: "shutdown", value: "shutdown" },
        { name: "server", value: "server" },
      ],
      required: true,
    },
    {
      name: "code",
      description: "No Description",
      type: 3,
      required: false,
    },
  ],
  cooldown: 5000,
  type: ApplicationCommandType.ChatInput,
  userPerms: ["SendMessages", "ViewChannel", "ReadMessageHistory"],
  botPerms: ["Administrator"],
  run: async (client, interaction) => {
    if (!client.config.OwnerID.includes(interaction.member.user.id)) {
      const nop = new EmbedBuilder().setColor("Red").setAuthor({
        name: `| Sorry, you can not use this command!`,
        iconURL: client.user.displayAvatarURL(),
      });
      return interaction.reply({ embeds: [nop], ephemeral: true });
    }

    let string_options = interaction.options.getString("string_options");
    if (string_options === "status") {
      let servercount = client.guilds.cache.size;
      let usercount = client.users.cache.size;
      let arch = os.arch();
      let platform = os.platform();
      let shard = client.ws.shards.size;
      let NodeVersion = process.version;
      let cores = os.cpus().length;
      const totalram = (os.totalmem() / 10 ** 6 + " ").split(".")[0];
      const freeram = (os.freemem() / 10 ** 6 + " ").split(".")[0];
      const usedram = ((os.totalmem() - os.freemem()) / 10 ** 6 + " ").split(
        "."
      )[0];
      const prctfreeram = ((os.freemem() * 100) / os.totalmem + " ").split(
        "."
      )[0];
      const usedmem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const totalmem = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
      const modalcpu = os.cpus().map((i) => `${i.model}`)[0];
      usagePercent(function (err, percent, seconds) {
        let a = new EmbedBuilder()
          .setTitle(
            `Bot Statistics | v${require("../../package.json").version}`
          )
          .setColor("#2F3136")
          .addFields(
            { name: "**Servers**", value: `\`${servercount}\``, inline: true },
            { name: "**Users**", value: `\`${usercount}\``, inline: true },
            { name: "**Architecture**", value: `\`${arch}\``, inline: true },
            { name: "**Platform**", value: `\`${platform}\``, inline: true },
            {
              name: "**Node Version**",
              value: `\`${NodeVersion}\``,
              inline: true,
            },
            { name: "**Shards**", value: `\`${shard}\``, inline: true },
            {
              name: "**Uptime**",
              value: `<t:${Math.floor(
                Date.now() / 1000 - client.uptime / 1000
              )}:R>`,
              inline: true,
            },
            {
              name: "**Latency**",
              value: `\`${Date.now() - interaction.createdTimestamp}ms\``,
              inline: true,
            },
            {
              name: "**API Latency**",
              value: `\`${Math.round(client.ws.ping)}ms\``,
              inline: true,
            },
            {
              name: "**Dependencies Version**",
              value: `\`\`\`discord.js: ${
                require("../../package.json").dependencies["discord.js"]
              }\n\ndiscord-api-types: ${
                require("../../package.json").dependencies["discord-api-types"]
              }\n\n@discordjs/rest: ${
                require("../../package.json").dependencies["@discordjs/rest"]
              }\n\naxios: ${
                require("../../package.json").dependencies["axios"]
              }\`\`\``,
            },
            {
              name: "**Memory**",
              value: `\`\`\`Memory Usage: ${usedmem}MB / ${totalmem}MB\n\nRAM Usage: ${usedram}MB / ${totalram}MB\n\nFree RAM Memory: ${freeram}MB (${prctfreeram}%)\`\`\``,
            },
            {
              name: `**CPU** (Sec: ${seconds})`,
              value: `\`\`\`Modal: ${modalcpu}\n\nUsage: ${percent.toFixed(
                2
              )}%\n\nSpeed: ${avgClockMHz()}MHz\n\nCores: ${cores}\`\`\``,
            }
          )
          .setTimestamp();
        interaction.reply({
          embeds: [a],
          ephemeral: true,
        });
        if (err) {
          interaction.reply({
            content: `\`ERROR\` \`\`\`xl\n${err}\n\`\`\``,
            ephemeral: true,
          });
        }
      });
    } else if (string_options === "shutdown") {
      try {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setDescription("**Shutdown Bot!**"),
          ],
          ephemeral: true,
        });
        setTimeout(() => {
          process.exit();
        }, 2000);

        const masterLogger = client.channels.cache.get("1007301420548108373");
        if (masterLogger) {
          await masterLogger.send({
            embeds: [
              new EmbedBuilder()
                .setTitle("Client Shutdown")
                .setThumbnail(
                  interaction.member.user.displayAvatarURL({
                    dynamic: true,
                    size: 512,
                  })
                )
                .setDescription(
                  `**Actioned by** : ${interaction.member.user.tag}`
                )
                .setColor("Green")
                .setTimestamp(),
            ],
          });
        }
      } catch (e) {
        interaction.reply({
          content: `\`ERROR\` \`\`\`xl\n${e}\n\`\`\``,
          ephemeral: true,
        });
      }
    } else if (string_options === "server") {
      try {
        const guilds = client.guilds.cache
          .sort((a, b) => b.memberCount - a.memberCount)
          .first(100);

        const description = guilds
          .map((guild, index) => {
            return `${index + 1}) ${guild.name} - ${
              guild.memberCount
            } members - ID: \`${guild.id}\``;
          })
          .join("\n");

        const embed = new EmbedBuilder()
          .setTitle("Server List - Top Member")
          .setDescription(description)
          .setColor("#2F3136")
          .setFooter({ text: `Total ${client.guilds.cache.size} servers` })
          .setTimestamp(new Date());
        interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (err) {
        interaction.reply({
          content: `\`ERROR\` \`\`\`xl\n${err}\n\`\`\``,
          ephemeral: true,
        });
      }
    } else if (string_options === "evaluate") {
      try {
        let codein = interaction.options.getString("code");
        if (!codein)
          return interaction.reply({
            content: `Need a code!`,
            ephemeral: true,
          });
        let code = eval(codein);
        if (typeof code !== "string")
          code = require("util").inspect(code, { depth: 0 });
        interaction.reply({
          content: `\`\`\`js\n${code}\n\`\`\``,
          ephemeral: true,
        });
      } catch (err) {
        return interaction.reply({
          content: `\`\`\`js\n${err}\n\`\`\``,
          ephemeral: true,
        });
      }
    } else if (string_options === "leave") {
      try {
        let codein = interaction.options.getString("code");
        if (!codein)
          return (
            interaction.reply({ content: `Need a code!`, ephemeral: true }),
            (id = interaction.guild.id)
          );
        const lguild = client.guilds.cache.get(codein);
        lguild.leave().then((g) =>
          interaction.reply({
            content: `**Succesfully left server!**\nName: ${g}\nMembers: ${g.memberCount} members\nID: \`${g.id}\``,
            ephemeral: true,
          })
        );
      } catch (err) {
        interaction.reply({
          content: `\`ERROR\` \`\`\`xl\n${err}\n\`\`\``,
          ephemeral: true,
        });
      }
    }
  },
};
function avgClockMHz() {
  //source: cpu-stat
  var cpus = os.cpus();
  var totalHz = 0;

  for (var i = 0; i < cpus.length; i++) {
    totalHz += cpus[i].speed;
  }

  var avgHz = totalHz / cpus.length;
  return avgHz;
}
function usagePercent(opts, cb) {
  //source: cpu-stat
  var cpus = os.cpus();

  var timeUsed;
  var timeUsed0 = 0;
  var timeUsed1 = 0;

  var timeIdle;
  var timeIdle0 = 0;
  var timeIdle1 = 0;

  var cpu1;
  var cpu0;

  var time;

  //opts is optional
  if (typeof opts === "function") {
    cb = opts;
    opts = {
      coreIndex: -1,
      sampleMs: 1000,
    };
  } else {
    opts.coreIndex = opts.coreIndex || -1;
    opts.sampleMs = opts.sampleMs || 1000;
  }

  //check core exists
  if (
    opts.coreIndex < -1 ||
    opts.coreIndex >= cpus.length ||
    typeof opts.coreIndex !== "number" ||
    Math.abs(opts.coreIndex % 1) !== 0
  ) {
    _error(opts.coreIndex, cpus.length);
    return cb(
      'coreIndex "' +
        opts.coreIndex +
        '" out of bounds, ' +
        "should be [0, " +
        (cpus.length - 1) +
        "]"
    );
  }

  //all cpu's average
  if (opts.coreIndex === -1) {
    //take first measurement
    cpu0 = os.cpus();
    time = process.hrtime();

    setTimeout(function () {
      //take second measurement
      cpu1 = os.cpus();

      var diff = process.hrtime(time);
      var diffSeconds = diff[0] + diff[1] * 1e-9;

      //do the number crunching below and return
      for (var i = 0; i < cpu1.length; i++) {
        timeUsed1 += cpu1[i].times.user;
        timeUsed1 += cpu1[i].times.nice;
        timeUsed1 += cpu1[i].times.sys;
        timeIdle1 += cpu1[i].times.idle;
      }

      for (i = 0; i < cpu0.length; i++) {
        timeUsed0 += cpu0[i].times.user;
        timeUsed0 += cpu0[i].times.nice;
        timeUsed0 += cpu0[i].times.sys;
        timeIdle0 += cpu0[i].times.idle;
      }

      timeUsed = timeUsed1 - timeUsed0;
      timeIdle = timeIdle1 - timeIdle0;

      var percent = (timeUsed / (timeUsed + timeIdle)) * 100;

      return cb(null, percent, diffSeconds);
    }, opts.sampleMs);

    //only one cpu core
  } else {
    //take first measurement
    cpu0 = os.cpus();
    time = process.hrtime();

    setTimeout(function () {
      //take second measurement
      cpu1 = os.cpus();

      var diff = process.hrtime(time);
      var diffSeconds = diff[0] + diff[1] * 1e-9;

      //do the number crunching below and return
      timeUsed1 += cpu1[opts.coreIndex].times.user;
      timeUsed1 += cpu1[opts.coreIndex].times.nice;
      timeUsed1 += cpu1[opts.coreIndex].times.sys;
      timeIdle1 += cpu1[opts.coreIndex].times.idle;

      timeUsed0 += cpu0[opts.coreIndex].times.user;
      timeUsed0 += cpu0[opts.coreIndex].times.nice;
      timeUsed0 += cpu0[opts.coreIndex].times.sys;
      timeIdle0 += cpu0[opts.coreIndex].times.idle;

      var timeUsed = timeUsed1 - timeUsed0;
      var timeIdle = timeIdle1 - timeIdle0;

      var percent = (timeUsed / (timeUsed + timeIdle)) * 100;

      return cb(null, percent, diffSeconds);
    }, opts.sampleMs);
  }
}
