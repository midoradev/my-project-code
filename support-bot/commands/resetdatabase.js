const Discord = require('discord.js')

exports.run = async (client, message, args) => {

    if (!client.config.OwnerID.includes(message.author.id)) {
        const nop = new MessageEmbed()
        .setColor("RED")
        .setDescription(`Xin lỗi, bạn không thể sử dụng lệnh này!`)
        return message.channel.send({embeds: [nop]})
    }

    client.calls.removeGuild(message.guild.id)
    client.calls.insertGuild(message.guild.id)

    const masterLogger = client.channels.cache.get('986518047743442944');
    if (masterLogger) {
        await masterLogger.send({
            embeds: [
                new MessageEmbed()
                    .setTitle('Client Reset Database')
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 512 }))
                    .setDescription(`**Actioned by** : ${message.author.tag}`)
                    .setColor('GREEN')
                    .setTimestamp(),
            ],
        });
    }

};

exports.help = {
    name: 'resetdatabase',
    aliases: ['resetDatabase', 'resetdata'],
    description: 'Reset Database (Owner Only)',
    usage: '=resetdatabase'
};