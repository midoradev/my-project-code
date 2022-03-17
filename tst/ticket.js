const
    Discord = require('discord.js'),
    embed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setAuthor('Ticket', 'https://i.imgur.com/gLC7Bf8.png')
        .setFooter('Ticket System')

module.exports = {
    name: 'ticket',
    main: function(parameters){
        if(this.filter(parameters.message) == false) return;
        if(!parameters.args[0])
            return paramaters.message.reply(
                'please specify whether you would like to' +
                '\`close\` or \`delete\` this ticket!'
            );

        switch(parameters.args[0].toLowerCase()){
            case 'close':
                embed.setDescription(
                    'This ticket was closed by a staff member!'
                );
                return parameters.message.channel.send(embed);

            case 'delete':
                embed.setDescription(
                    'Please react with the emojis according\nto the ' +
                    'action you would like to perform!'
                );
                return parameters.message.channel.send(embed).then(message => {
                    message.react('🔒');
                    const collector = message.createReactionCollector((reaction, user) => 
                        ['🔒', '✅'].includes(reaction.emoji.name) &&
                        user.id == parameters.message.author.id && !user.bot,
                        {'dispose': true}
                    );
                    return collector
                        .on('collect', (reaction) => {
                            switch(reaction.emoji.name){
                                case '🔒':
                                    return message.react('✅');
                                
                                case '✅':
                                    return message.channel.delete().then(collector.stop());
                            }
                        })
                        .on('remove', (reaction) => {
                            if(reaction.emoji.name == '🔒') 
                                return message.reactions.cache.find(reaction => 
                                    reaction.emoji.name == '✅'    
                                ).remove();
                        });
                });

        }
    },
    create: function(reaction, user){
        if(!(reaction.emoji.name == '🎟️' && reaction.message.id == '')) return;
        if(reaction.message.guild.channels.cache.some(channel => 
            channel.name.toLowerCase().includes(user.id) &&
            channel.type == 'text'
        )) return;

        return reaction.message.guild.channels.create(`ticket-${user.tag}-${user.id}`, {
            parent: '',
            permissionOverwrites: [
                {
                    'id': reaction.message.guild.roles.everyone.id,
                    'deny': ['VIEW_CHANNEL']
                },
                {
                    'id': user.id,
                    'allow': ['VIEW_CHANNEL', 'SEND_MESSAGES']
                }
            ]
        }).then(channel => {
            embed.setDescription(
                'You have opened a ticket! ' +
                'Please state your issue,\n' +
                'a staff member will soon be in touch!'
            );
            channel.send(embed).then(() => channel.send(`<@${user.id}>`));

            const
                transcript = [],
                collector = channel.createMessageCollector(message => !message.author.bot);

            collector
                .on('collect', (message) => {
                    if(
                        message.content.toLowerCase().startsWith('.ticket close') &&
                        this.filter(message) == true
                    ) return collector.stop();

                    transcript.push({
                        'content': message.content,
                        'author': {
                            'id': message.author.id,
                            'tag': message.author.tag
                        },
                        'timestamp': message.createdAt.toLocaleString(),
                        'embeds': message.embeds.map((embed, index) =>
                            `Embed ${(index+1)}:\nTitle: ${embed.title}\n` +
                            `Author: ${embed.author}\nContent: ${embed.description}\n` +
                            `URL: ${embed.url}`
                        )
                    });
                })
                .on('end', () => {
                    const fs = require('fs');
                    if(transcript.length > 0)
                        return fs.writeFileSync(
                            `transcript${channel.id}.txt`,
                            transcript.map(message =>
                                `${message.author.tag}-${message.author.id} at ` +
                                `${message.timestamp}: ${message.content}\n` +
                                `Embeds: ${message.embeds.join('\n')}`
                            ).join('\n\n')
                        );
                });

            return channel.awaitMessages(message =>
                message.author.id == user.id,
                {'max': 1, 'time': 120000}    
            ).then(messages => {
                if(!messages.first()) return channel.delete();
            });
        });
    },
    filter: (message) => (
        message.member.hasPermission('ADMINISTRATOR') && 
        message.channel.name.toLowerCase().includes('ticket')
    )
}
