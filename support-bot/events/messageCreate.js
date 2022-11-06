const { Collection, MessageAttachment, MessageEmbed, User } = require('discord.js');

const ms = require('ms');
let config = require('../config.json');
const {
    checkFilter
} = require("../utils/functions");
/**
 * @type {Collection<string, boolean>}
 */
const Cooldown = new Collection();

/**
 * @type {Collection<string, Collection<string, number>>}
 */
const cooldowns = new Collection();

/**
 * @param {import('../classes/Bot')} client
 * @param {import('discord.js').Message} message
 */
module.exports = async (client, message) => {

    const {
        convertChannel,
        convertCategory,
        convertRole,
        convertMember,
    } = require(`${process.cwd()}/utils/functions`);
    const Calls = require(`${process.cwd()}/database/monk`);
    
    //CLIENT VARIABLES
    client.config = require(`${process.cwd()}/config.json`);
    client.prefix = client.config.defaults.prefix
    client.calls = Calls
    client.ms = require('ms');
    client.convertChannel = convertChannel;
    client.convertCategory = convertCategory;
    client.convertRole = convertRole;
    client.convertMember = convertMember;

    let prefix = config.defaults.prefix
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.content.indexOf(prefix) !== 0) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = client.commands.get(command) || client.commands.find((c) => c.help.aliases && c.help.aliases.includes(command));
    if (!cmd) return

    if (cmd.help.permission && !message.member.roles.cache.find((r) => r.name === cmd.help.permission)) return;

    if (!cooldowns.has(cmd.name)) cooldowns.set(cmd.name, new Collection());
    const now = Date.now();
    const timestamps = cooldowns.get(cmd.name);
    const cooldownAmount = cmd.help.cooldown || 3000;
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = Math.floor(expirationTime - now);
            return message.channel.send(`Vui lòng đợi thêm **${ms(timeLeft)}** nữa để sử dụng lại lệnh!`);
        }
    }

    try {
        await cmd.run(client, message, args);
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    } catch (e) {
        console.log(e);
    }

};