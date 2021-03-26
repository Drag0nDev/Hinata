const {MessageEmbed} = require('discord.js');
const {Permissions, Minor} = require('../../misc/tools');
const logger = require("log4js").getLogger();
const config = require('../../../config.json');

module.exports = {
    name: 'reloadserver',
    aliases: ['rs'],
    category: 'ownerdb',
    description: 'Reload a server for the database',
    usage: '[command | alias] <server id>',
    ownerOnly: true,
    run: async (bot, message, args) => {
        const server = bot.guilds.cache.get(args[0]);
        let embed = new MessageEmbed().setColor(bot.embedColors.ready);
        let count = 0;

        try {
            for (const member of server.members.cache) {
                if (!member[1].user.bot) {
                    await Minor.dbAdd(member, server);
                    count++;
                }
            }
            embed.setDescription(`Reloaded database for server: **${server.name}**.\n` +
                `with **${count}** members.`);

            await message.channel.send(embed);
        } catch (err) {
            embed.setColor(bot.embedColors.embeds.error)
                .setDescription(err);
            logger.error(err);
            await message.channel.send(embed);
        }
    }
}