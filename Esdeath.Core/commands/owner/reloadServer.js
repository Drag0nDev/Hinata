const {MessageEmbed} = require('discord.js');
const {User, ServerUser, Server} = require('../../../dbObjects');

module.exports = {
    name: 'reloadserver',
    aliases: ['rs'],
    category: 'owner',
    description: 'Reload a server for the database',
    usage: '[command | alias] <server id>',
    run: async (bot, message, args) => {
        const server = bot.guilds.cache.get(args[0]);
        let embed = new MessageEmbed().setColor(bot.embedColors.ready);
        let count = 0;

        try {
            for (const member of server.members.cache) {
                if (!member[1].user.bot) {
                    await ServerUser.findOrCreate({
                        where: {
                            userId: member[1].user.id,
                            guildId: member[1].guild.id
                        }
                    });
                    await User.findOrCreate({
                        where: {
                            userId: member[1].user.id
                        },
                        defaults: {
                            userTag: `${member[1].user.username}#${member[1].user.discriminator}`
                        }
                    });
                    await Server.findOrCreate({
                        where: {
                            serverId: server.id
                        },
                        defaults: {
                            serverName: server.name
                        }
                    });
                    count++;
                }
            }
            embed.setDescription(`Reloaded database for server: **${server.name}**.\n
        with **${count}** members.`);

            await message.channel.send(embed);
        } catch (err) {
            embed.setColor(bot.embedColors.error)
                .setDescription(err);
            await message.channel.send(embed);
        }

    }
}