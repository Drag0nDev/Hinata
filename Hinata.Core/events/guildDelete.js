const {Server, Rewards, ServerSettings, Timers, ServerUser, Warnings} = require('../misc/dbObjects');
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
    post.channel = await post.support.channels.cache.get('826725616560766996');

    await Server.destroy({
        where: {
            serverId: server.id
        }
    });

    await Rewards.destroy({
        where: {
            serverId: server.id
        }
    });

    await ServerUser.destroy({
        where: {
            guildId: server.id
        }
    });

    await ServerSettings.destroy({
        where: {
            serverId: server.id
        }
    });

    await Warnings.destroy({
        where: {
            guildId: server.id
        }
    });

    await Timers.destroy({
        where: {
            guildId: server.id
        }
    });

    post.embed.addFields(post.fields)
    post.channel.send(post.embed);
}