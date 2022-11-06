const Discord = require('discord.js')

exports.run = async (client, message, args) => {
    
    if (client.config.feedback.toggle) {
;        const feedbackQuery = args.join(" ");
        if(!feedbackQuery) return message.reply("**Vui lòng nêu feedback khi sử dụng Starsky!**\nUsage: `=feedback <your feedback>`");

        if (args) {

            let feedbackEmbed = new Discord.MessageEmbed()
                .setAuthor({ name: `${message.author.username}'s Feedback`, iconURL: message.author.displayAvatarURL() })
                .setDescription(`\`\`\`${args.join(" ")}\`\`\``)
                .setColor("#C2E8FF")
                .setFooter({
                    text: `MemberID: ${message.author.id}`
                })

            try {
                

                let channel = client.convertChannel(message.guild, client.config.feedback.channelid)
                let feedbackMessage = await channel.send({
                    embeds: [feedbackEmbed]
                })

                await feedbackMessage.react('👍')
                await feedbackMessage.react('🤷')
                await feedbackMessage.react('👎')
                return message.delete();

            } catch (err) {
                return console.log(err)
            }

        } else {

            return message.channel.send("❌ | Bạn không thể feedback!")

        }

    } else {

        return message.channel.send("❌ Feedback không được bật!")

    }

};

exports.help = {
    name: 'feedback',
    aliases: ['fb'],
    description: 'Tạo ra một feedback',
    usage: '=feedback <your feedback>'
};