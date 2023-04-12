const { Collection } = require("@discordjs/collection");
const { Client, Embed } = require("guilded.js");
const fs = require("fs");
const config = require("./config.json");
const { connect } = require("mongoose");
const got = require("got");
const automeme = require("./utils/model");
require("dotenv").config();

const client = new Client({
  token: config.token || process.env["TOKEN"],
});

//Collection
client.commands = new Collection();
client.aliases = new Collection();
client.prefix = config.prefix || process.env["PREFIX"];
client.config = config;

//Bot start
client.on("ready", () => {
  connect(config.mongodb || process.env["MONGODB"], { keepAlive: true })
    .then(() => {
      console.log("Connected to database!");
    })
    .catch(() => {
      console.log(`Can't connect to mongodb`);
    });
  console.log(`Bot is successfully logged in as ${client.user.name}`);
});

//Loading commands
fs.readdir("./commands/", (err, files) => {
  if (err) return console.log("Could not find any commands!");
  const jsFiles = files.filter((f) => f.split(".").pop() === "js");
  if (jsFiles.length <= 0) return console.log("Could not find any commands!");
  jsFiles.forEach((file) => {
    const cmd = require(`./commands/${file}`);
    console.log(`Loaded ${file}`);
    client.commands.set(cmd.name, cmd);
    if (cmd.aliases)
      cmd.aliases.forEach((alias) => client.aliases.set(alias, cmd.name));
  });
});

//Message Event
client.on("messageCreated", async (message) => {
  const prefix = config.prefix || process.env["PREFIX"];
  const member = await client.members.fetch(
    message.serverId,
    message.createdById
  );
  if (!message.content.startsWith(prefix) || member.user.type == "bot") return;

  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const cmd =
    client.commands.get(command) ||
    client.commands.get(client.aliases.get(command));
  if (!cmd) return;
  try {
    cmd.run(client, message, args);
  } catch (e) {
    console.error(e);
    message.reply(`There was an error trying to execute that command!`);
  }
});

//Automeme Event
client.on("ready", () => {
  client.servers.cache.forEach((server) => {
    if (!server || !server.id) return;

    automeme.findOne({ server: server.id }, async (err, data) => {
      if (!data) return;

      setInterval(() => {
        if (!data) return;
        if (!data.channel) return;

        if (err) throw err;
        let subreddit = [
          "dankmemes",
          "memes",
          "meme",
          "me_irl",
          "wholesomememes",
          "4chan",
          "animemes",
          "funny",
          "historymemes",
          "prequelmemes",
        ];
        let random = subreddit[Math.floor(Math.random() * subreddit.length)];

        got(`https://www.reddit.com/r/${random}/random/.json`).then(
          async (response) => {
            const [list] = JSON.parse(response.body);
            const [post] = list.data.children;

            const permalink = post.data.permalink;
            const memeUrl = `https://reddit.com${permalink}`;
            const memeImage = post.data.url;
            const memeTitle = post.data.title;
            const memeUpvotes = post.data.ups;
            const memeDownvotes = post.data.downs;
            const memeNumComments = post.data.num_comments;
            const memeAuthor = post.data.author;

            const embed = new Embed()
              .setAuthor(`Posted by u/${memeAuthor}`)
              .setTitle(`${memeTitle}`)
              .setURL(`${memeUrl}`)
              .setImage(memeImage)
              .setColor([231, 229, 229])
              .setFooter(
                `From r/${random} • 👍 ${memeUpvotes} • 👎 ${memeDownvotes} • 💬 ${memeNumComments}`
              );
            // client.channels.cache.get(data.channel).send({ embeds: [embed] });
           (await client.channels.fetch(data.channel)).send({ embeds: [embed] })
          }
        );
      }, 5000);
    });
  });
});
client.on("exit", () => {

})

process.on("unhandledRejection", (reason, p) => {
  console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
  console.log(err, origin);
});

client.login();
