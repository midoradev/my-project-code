const Discord = require('discord.js')

exports.run = async (client, message, args) => {

    const suggestionsButtonRow = new Discord.MessageActionRow().addComponents(

        new Discord.MessageButton()
        .setCustomId('suggestion_accept')
        .setEmoji("✅")
        .setLabel("Accept")
        .setStyle('SUCCESS'),

        new Discord.MessageButton()
        .setCustomId('suggestion_deny')
        .setEmoji("❌")
        .setLabel("Deny")
        .setStyle('DANGER')
        

    );
    
    if (client.config.suggestion.toggle) {
;        const suggestionQuery = args.join(" ");
        if(!suggestionQuery) return message.reply("**Vui lòng nêu ý kiến của bạn!**\nUsage: `=suggest <your suggest>`");

        if (args) {

            let suggestionEmbed = new Discord.MessageEmbed()
                .setAuthor({ name: `${message.author.username}'s suggestion`, iconURL: message.author.displayAvatarURL() })
                .setDescription(`\`\`\`${args.join(" ")}\`\`\``)
                .setColor("#C2E8FF")
                .setFooter({
                    text: `MemberID: ${message.author.id}`
                })


            try {
                

                let channel = client.convertChannel(message.guild, client.config.suggestion.channelid)
                let suggestionMessage = await channel.send({
                    embeds: [suggestionEmbed],
                    components: [
                        suggestionsButtonRow
                    ]
                })

                await suggestionMessage.react('👍')
                await suggestionMessage.react('👎')
                return message.delete();

            } catch (err) {
                return console.log(err)
            }

        } else {

            return message.channel.send("❌ | Bạn không thể suggest điều gì cả!")

        }

    } else {

        return message.channel.send("❌ Suggestions không được bật!")

    }

};

exports.help = {
    name: 'suggest',
    aliases: ['suggest'],
    description: 'Tạo ra một suggest',
    usage: '=suggest <your suggest>'
};