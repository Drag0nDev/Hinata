const config = require("../../../config.json");
const {MessageEmbed} = require('discord.js');
const log4js = require("log4js");

module.exports = {
    name: 'setname',
    aliases: ['changename', 'newname'],
    category: 'owner',
    description: 'Change esdeaths displayname',
    usage: '[command | alias] [new name]',
    run: async (bot, message, args) => {
        const logger = log4js.getLogger();
        let embed = new MessageEmbed();

        if (!(message.member.id === config.OWNER))
            return message.channel.send(embed.setDescription(`${message.author} this is a command only for my creator!`)
                .setColor(bot.embedColors.error.code));

        const newName = args.join(' ');

        let oldName = bot.user.tag;

        await bot.user.setUsername(newName);

        embed.setColor(bot.embedColors.normal.code)
            .setDescription('Username changed successfully!')
            .addField('Old name', oldName)
            .addField('New name', bot.user.tag);

        await message.channel.send(embed);

        logger.warn(`Name changed from '${oldName}' to '${bot.user.tag}'`)
    }
}