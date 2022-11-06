const { MessageEmbed } = require('discord.js')

exports.run = async (client, message, args) => {


    if (!client.config.OwnerID.includes(message.author.id)) {
        const nop = new MessageEmbed()
            .setColor("RED")
            .setDescription(`Xin lỗi, bạn không thể sử dụng lệnh này!`)
        return message.channel.send({ embeds: [nop] })
    }
    let faq = new MessageEmbed()
        .setColor('#FFFFFF')
        .setTitle('Starsky là gì?')
        .setDescription("Starsky là một giveaway discord bot giúp bạn tạo giveaway trên server Discord của bạn một cách nhanh chóng và dễ dàng!")
    let faq1 = new MessageEmbed()
        .setColor('#FFFFFF')
        .setTitle('Tại sao bot lại xóa prefix cũ?')
        .setDescription(`Do Discord nha! Nếu không thấy bot hiện Slash Command thì Re-Invite (không cần kick) lại nha! [Link Invite](https://discord.com/api/oauth2/authorize?client_id=909386183107305504&permissions=8&scope=bot%20applications.commands)`)
    let faq2 = new MessageEmbed()
        .setColor('#FFFFFF')
        .setTitle('Tại sao tôi không thể sử dụng Slash Commands?')
        .setDescription("Re-Invite lại bot bằng đường link trên và bật cho role @everyone có \`Use Application Commands\` permission!")
        .setImage("https://media.discordapp.net/attachments/919752571315425291/982299428012585001/Screenshot_172.png")
    let faq3 = new MessageEmbed()
        .setColor('#FFFFFF')
        .setTitle('Tại sao bot lại không phản hồi? Làm sao để sửa?')
        .setDescription("- Bật cho bot permission ADMINISTRATOR\n- Chỗ host của bot bị sập hoặc vBeta ko hoạt động\n- Database của bot đang disconecting")
    let faq4 = new MessageEmbed()
        .setColor('#FFFFFF')
        .setTitle('Làm sao để mua premium của Starsky?')
        .setDescription("Click vào trang [patreon](https://www.patreon.com/notmythdora) của Starsky để lựa chọn gói và mua sau đó hãy mở ticket ở <#919756525273227384> để được tư vấn!")
    let faq5 = new MessageEmbed()
        .setColor('#FFFFFF')
        .setTitle('Có cách nào mua premium của Starsky ngoài trang patreon không?')
        .setDescription("Có nha! Bạn có thể lựa chọn những gói sau:\n- 50.000 VNĐ: 1 premium server\n- 100.000 VNĐ: 3 premium server\n- 150.000 VNĐ: 6 premium server\n\nNote:\n- Chỉ nhận card Viettel, VinaPhone hoặc chuyển khoản qua MoMo\n- Nhớ mở ticket để mua nha")

    message.delete()
    message.channel.send({ embeds: [faq, faq1, faq2, faq3, faq4, faq5] })

};

exports.help = {
    name: 'faq',
    aliases: ['faq'],
    description: 'Starsky Frequently Asked Questions (Onwer Only)',
    usage: '=faq'
};