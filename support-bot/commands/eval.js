const { MessageEmbed } = require("discord.js");

    exports.run = async (client, message, args) => {

        if (!client.config.OwnerID.includes(message.author.id)) {
            const nop = new MessageEmbed()
            .setColor("RED")
            .setDescription(`Xin lỗi, bạn không thể sử dụng lệnh này!`)
            return message.channel.send({embeds: [nop]})
        }

        let codein = args.join(' ');
		try {
			let code = eval(codein);
			if (typeof code !== 'string') code = require('util').inspect(code, { depth: 0 });
			message.channel.send(`\`\`\`js\n${code}\n\`\`\``);
		} catch (e) {
			return message.channel.send(`\`\`\`js\n${e}\n\`\`\``);
		}

    };
    
exports.help = {
    name: 'eval',
    aliases: ['evaluate', 'ev'],
    description: 'Evaluate something',
    usage: '=evaluate <code>'
};