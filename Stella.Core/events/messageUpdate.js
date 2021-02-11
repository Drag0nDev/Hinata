const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Logs} = require("../misc/tools");

module.exports = async (bot, oldMessage, newMessage) => {
    try {
        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logChange)
            .setAuthor(`${newMessage.author.username}#${newMessage.author.discriminator}`,
                newMessage.author.avatarURL({dynamic: true}),
                newMessage.author.avatarURL({dynamic: true, size: 4096}))
            .setTitle(`Message edited in #${newMessage.channel.name}`)
            .setFooter(`ID: ${newMessage.author.id}`);

        if (newMessage.author.bot) return;
        if (oldMessage.content === newMessage.content) return;

        embed.addField('Old message', oldMessage.content)
            .addField('New message', newMessage.content);

        await Logs.messageLog(newMessage.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}