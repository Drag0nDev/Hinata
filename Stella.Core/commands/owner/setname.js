const config = require("../../../config.json");
const {MessageEmbed} = require('discord.js');
const log4js = require("log4js");
const {Permissions} = require('../../misc/tools');

module.exports = {
    name: 'setname',
    aliases: ['changename', 'newname'],
    category: 'owner',
    description: 'Change esdeaths displayname',
    usage: '[command | alias] [new name]',
    run: async (bot, message, args) => {
        const logger = log4js.getLogger();
        let embed = new MessageEmbed();

        if (message.author.id !== config.owner) {
            Permissions.ownerOnly(bot, message.channel)
            return;
        }

        const newName = args.join(' ');

        let oldName = bot.user.tag;

        bot.user.setUsername(newName)
            .then(updated => {
                embed.setColor(bot.embedColors.normal)
                    .setDescription('Username changed successfully!')
                    .addField('Old name', oldName)
                    .addField('New name', updated.tag);

                message.channel.send(embed);

                logger.warn(`Name changed from '${oldName}' to '${bot.user.tag}'`);
            })
            .catch(err => {
                embed.setDescription(err)
                    .setColor(bot.embedColors.error);
                message.channel.send(embed);
            });
    }
}