const {Minor} = require('../misc/tools');
const {MessageEmbed} = require('discord.js');

module.exports = async (bot, server) => {
    const post = {
        support: await bot.guilds.cache.get('645047329141030936'),
        embed: new MessageEmbed().setTitle('New server joined')
            .setThumbnail(server.iconURL({
                dynamic: true,
                size: 4096
            }))
            .setColor(bot.embedColors.logs.join),
        fields: [
            {
                name: 'Name:',
                value: server.name,
                inline: false
            },
            {
                name: 'Member count:',
                value: server.memberCount,
                inline: false
            }
        ]
    };
    post.channel = await post.support.channels.cache.get('826725606619611187');

    for (const member of server.members.cache) {
        if (!member[1].user.bot) {
            await Minor.dbAdd(member, server);
        }
    }

    post.embed.addFields(post.fields)
    post.channel.send(post.embed);
}