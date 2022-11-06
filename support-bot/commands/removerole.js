exports.run = async (client, message, args) => {

    if (client.config.removerole.toggle) {

        if (!message.member.permissions.has('MANAGE_ROLES')) return message.channel.send("❌ | Bạn không có quyền để sử dụng lệnh này!");

        try {

            let member = await client.convertMember(message.guild, message.mentions.members.first() || args[0])
            let role = await client.convertRole(message.guild, message.mentions.roles.first() || args[1])

            if(!member || !role) return message.channel.send("❌ | Role hoặc member không hợp lệ");

            try {

                await member.roles.remove(role)

            } catch (err) {

                console.log(err)
                return message.channel.send("❌ | Bạn không đủ quyền để sử dụng lệnh này!");

            }

            message.channel.send(`✅ | <@!${member.id}> đã mất role <@&${role.id}>`);

        } catch (err) {

            return message.channel.send("❌ | Vui lòng cung cấp người được giao role!\nUsage: `=addrole @user @role`");

        }

    } else {

        return message.channel.send("❌ | Remove role của bot không được cho phép!")

    }

};

exports.help = {
    name: 'removerole',
    aliases: ['removeRole', 'takerole', 'rrole', 'rremove', 'roleremove', 'rr', 'rrmv', 'rmvr'],
    description: 'Remove role cho một người nào đó',
    usage: '=removerole @user @role'
};