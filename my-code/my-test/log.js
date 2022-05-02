require("dotenv")
const {
    Client,
    MessageEmbed,
    MessageAttachment
} = require("discord.js");
const db = require("quick.db")

const Discord = require('discord.js');
const client = new Client({
    disableEveryone: true
})
const Data = new Discord.Collection();
const invites = {};
const wait = require('util').promisify(setTimeout);
const keepAlive = require('./server.js')
keepAlive()
client.on('ready', async () => {
    console.clear()
    console.log(`${client.user.tag} is online`)
    await wait(1000);
    client.guilds.cache.forEach(g => {
      g.fetchInvites().then(guildInvites => {
        invites[g.id] = guildInvites;
      })
    });
  });
const picExt = [".webp", ".png", ".jpg", ".jpeg", ".gif"];
const videoExt = [".webm", ".mp4", ".mov"];

const channel_logger_id = require("./config").channel_id
const prefix = require("./config").prefix

client.on("inviteCreate", (invite) => {
    client.guilds.cache.forEach(g => {
   g.fetchInvites().then(guildInvites => {
     invites[g.id] = guildInvites;
   })
 })
});

client.on("inviteDelete", (invite) => {
   client.guilds.cache.forEach(g => {
   g.fetchInvites().then(guildInvites => {
     invites[g.id] = guildInvites;
   })
 })
});


client.on('guildMemberAdd', async member => {
 member.guild.fetchInvites().then(async guildInvites => {
     const ei = invites[member.guild.id];
     invites[member.guild.id] = guildInvites;
     const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses) || member.guild.vanityURLCode
     const inviter = client.users.cache.get(invite.inviter.id);
     if(invite == member.guild.vanityURLCode) {
        description = `${member} joined with vanity code`
        footer = ""
     }
     if (invite.inviter) {
       await db.set(`${member.id}.inviter`, invite.inviter.id);
       let check_data = await db.get(`${invite.inviter.id}.join`)
       if (check_data == null) await db.set(`${invite.inviter.id}.join`, 0)
       let check_leave = await db.get(`${invite.inviter.id}.leave`)
       if (check_leave == null) await db.set(`${invite.inviter.id}.leave`, 0)
       let leave  = await db.get(`${invite.inviter.id}.leave`)
       let join = await db.get(`${invite.inviter.id}.join`)
       join+=1;
       db.set(`${invite.inviter.id}.join`, join)
       description = `
      **${invite.inviter} Profile**
      **Join count**: ${join}
      **Leave count**: ${leave}
      **Total invite count** ${join-leave}
      `
      footer = `${member.user.tag} was invited by ${invite.inviter.tag}`
     }
     let channel = member.guild.channels.cache.find((ch) => ch.id === channel_logger_id);
     const LogEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor(`${member.user.tag} joined!`,member.user.displayAvatarURL({dynamic: true}))
      .setDescription(description)
      .setTimestamp()
      .setFooter(footer)
      channel.send(LogEmbed)
      });
});



client.on("guildMemberRemove",async (member) => {
 let inviter = await db.get(`${member.id}.inviter`)
 let check_data = await db.get(`${inviter}.join`)
 if (check_data == null) await db.set(`${inviter}.join`, 0)
 let check_leave = await db.get(`${inviter}.leave`)
 if (check_leave == null) await db.set(`${inviter}.leave`, 0)
 let leave  = await db.get(`${inviter}.leave`)
 let join = await db.get(`${inviter}.join`)
 var description, footer
 if (!inviter) { 
   description = `${member} just left the server` 
   footer = `${member.user.tag} joined with vanity code`
 } else  {
   description = `
      **${member.guild.members.cache.get(inviter).user.tag} Profile**
      **Join count**: ${join}
      **Leave count**: ${leave}
      **Total invite count** ${join-leave}
      `
   footer = `${member.user.tag} was invited by ${member.guild.members.cache.get(inviter).user.tag}`
 }
 leave+=1
 await db.set(`${inviter}.leave`, leave)
 let channel = member.guild.channels.cache.find((ch) => ch.id === channel_logger_id);
 const LogEmbed = new Discord.MessageEmbed()
   .setColor("RANDOM")
   .setAuthor(`${member.user.tag} left!`,member.user.displayAvatarURL({dynamic: true}))
   .setDescription(description)
   .setTimestamp()
   .setFooter(footer)
 channel.send(LogEmbed)
})
const prefix = require("./config").PREFIX
client.on("message", async (message, args) => {
   if (message.author.bot) return
   let check_data = await db.get(`${message.author.id}.join`)
   if (check_data == null) await db.set(`${message.author.id}.join`, 0)
   let check_leave = await db.get(`${message.author.id}.leave`)
   if (check_leave == null) await db.set(`${message.author.id}.leave`, 0)
   let leave  = await db.get(`${message.author.id}.leave`)
   let join = await db.get(`${message.author.id}.join`)
   if (message.content.replace(/ /g, '').toLowerCase().startsWith(prefix + "invites")) {
      const Embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor(message.author.tag,message.author.displayAvatarURL({dynamic: true}))
      .setDescription(`**Your invite count is**: ${join-leave}`)
      .setTimestamp()
      message.channel.send(Embed)
   }
})

client.on("messageDelete", async (message) => {
    if (message.author.bot) return;
    let check_data = await db.get("logs")
    if (check_data == null) await db.set("logs", [])
    let logs = await db.get("logs")
    logs.unshift({
        content: message.content,
        author: message.author,
        image: message.attachments.first() ?
            message.attachments.first().proxyURL :
            null,
        date: new Date().toLocaleString("en-GB", {
            dataStyle: "full",
            timeStyle: "short",
        }),
    });
    logs.splice(10);
    await db.set("logs", logs)
    const attachment = message.attachments.first() ? message.attachments.first().proxyURL : null
    let description = `message deleted in ${message.channel}\n**Content**\n${message.content ? message.content : "message has no content"}`
    let check = false
    let embed = new MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL({
            dynamic: true
        }))
        .setColor(`RANDOM`)
        .setFooter(client.user.tag, client.user.avatarURL({
            dynamic: true
        }))
        .setTimestamp()
    if (attachment != null) {
    picExt.forEach(async (ext) => {
        if (attachment.endsWith(ext)) {
            check = true
        }
    })
    if (check == true) {
        embed.setImage(attachment)
        embed.setDescription(description)
    } else {
        description = `message deleted in ${message.channel}\n**Content**\n${message.content ? message.content : "message has no content"}\n**Attachment**\n[Click here](${attachment})`
        embed.setDescription(description)
    }
    } else embed.setDescription(description)
    let channel = message.guild.channels.cache.find((ch) => ch.id === channel_logger_id);
    if (!channel) return;
    channel.send(embed);
});
client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (oldMessage.author.bot) return;
    let check_data = await db.get("logs")
    if (check_data == null) await db.set("logs", [])
    let logs = await db.get("logs")
    logs.unshift({
        content: oldMessage.content,
        author: oldMessage.author,
        image: oldMessage.attachments.first() ?
            oldMessage.attachments.first().proxyURL :
            null,
        date: new Date().toLocaleString("en-GB", {
            dataStyle: "full",
            timeStyle: "short",
        }),
    });
    logs.splice(10);
    await db.set("logs", logs)

    let embed = new MessageEmbed()
        .setAuthor(oldMessage.author.tag, oldMessage.author.avatarURL({
            dynamic: true
        }))
        .setDescription(`
      message updated in ${oldMessage.channel}
      **Before**\n${oldMessage.content ? oldMessage.content : "message has no content"}
      **After**\n${newMessage.content ? newMessage.content : "message has no content"}
      `)
        .setColor(`RANDOM`)
        .setImage(oldMessage.attachments.first() ? oldMessage.attachments.first().proxyURL : null)
        .setFooter(client.user.tag, client.user.avatarURL({
            dynamic: true
        }))
        .setTimestamp()
    let channel = oldMessage.guild.channels.cache.find((ch) => ch.id === channel_logger_id);
    if (!channel) return;
    channel.send(embed);
});
client.on("message", async (message, args) => {
    if (message.author.bot) return
    if (message.content.replace(/ /g, '').toLowerCase().startsWith(prefix + "snipe")) {
        var args = message.content.split(" ").slice(0)
        var args = args.slice(1)
        let check_data = await db.get("logs")
        if (check_data == null) await db.set("logs", [])
        const snipes = await db.get("logs")
        const msg = snipes[args[0] - 1 || 0];
        if (!msg) return message.channel.send(`That is not a valid snipe...`);
        const author = message.guild.members.cache.get(msg.author.id)
        let description = `**Content**\n${msg.content}`
        const Embed = new MessageEmbed()
            .setColor("RANDOM")
            .setAuthor(
                author.user.tag,
                author.user.displayAvatarURL({
                    dynamic: true
                })
            )
            .setFooter(`Date: ${msg.date} | ${args[0] || 1}/${snipes.length}`)
        let check = false
        if (msg.image != null) {
        picExt.forEach(async (ext) => {
            if (msg.image.endsWith(ext)) {
                check = true
            }
        })
        if (check == true) {
            Embed.setImage(msg.image)
            Embed.setDescription(description)
        } else {
            description = `Message deleted in ${message.channel}\n**Content**\n${message.content ? message.content : "Message has no content"}\n**Attachment**\n[Click here](${msg.image})`
            Embed.setDescription(description)
        }
        } else Embed.setDescription(description)
        message.channel.send(Embed);
    }
})

client.login(process.env.TOKEN);
