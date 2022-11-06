const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args) => {

    if(!message.member.permissions.has("MANAGE_MESSAGES")) return message.channel.send("❌ | Bạn không có quyền để sử dụng lệnh này!");

        const embed1 = new MessageEmbed()
        .setDescription(`❌ | Vui lòng cung cấp thời gian cho slowmode!`)
        .setColor("RED");

        const embed2 = new MessageEmbed()
        .setDescription(`❌ | Vui lòng nêu ra một số!`)
        .setColor("RED");

        const embed3 = new MessageEmbed()
        .setDescription(`✅ | Slowmode đã được tắt!`)
        .setColor("GREEN");

        const embed4 = new MessageEmbed()
        .setDescription(`❌ | Slowmode không thể âm`)
        .setColor("RED");

        const embed5 = new MessageEmbed()
        .setDescription(`✅ | Thành công chuyển ${message.channel}'s slowmode to ${args[0]}.`)
        .setColor("GREEN");

        const embedError = new MessageEmbed()
        .setDescription(`❌ | Đã xảy ra lỗi khi dùng lệnh. Đảm bảo rằng tôi có quyền \`ADMINSTRATOR\`!`)
        .setColor("RED");

        if (!args[0]) return message.reply({ embeds: [embed1]});

        if (isNaN(args[0])) return message.reply({ embeds: [embed2]});

        if(args[0] == 0) return message.reply({ embeds: [embed3]}).then( message.channel.setRateLimitPerUser(null).catch(err => message.channel.send({ embeds: [embedError]})) )

        if(args[0] < 0) return message.reply({ embeds: [embed4]});

        message.channel.setRateLimitPerUser(args[0]).catch(err => message.channel.send({ embeds: [embedError]}));
        
        message.reply({ embeds: [embed5]});

};

exports.help = {
    name: 'slowmode',
    aliases: ['slow', 'sm', 'slowm', 'slm'],
    description: 'Sets the channel\'s slowmode',
    usage: '=slowmode <time>'
};