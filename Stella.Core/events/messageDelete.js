const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Logs} = require("../misc/tools");

module.exports = async (bot, message) => {
    try {
        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logRemove)
            .setAuthor(`${message.author.username}#${message.author.discriminator}`,
                message.author.avatarURL({dynamic: true}),
                message.author.avatarURL({dynamic: true, size: 4096}))
            .setTitle('Message deleted')
            .setFooter(`ID: ${message.author.id}`);

        if (message.author.bot) return;

        if (message.content !== '')
            embed.addField(`Message deleted in #${message.channel.name}`, message.content);
        if (message.attachments.size > 0) {
            embed.addField('Attachement', message.attachments.first().name);
            embed.setImage(message.attachments.first().proxyURL);
        }

        await Logs.messageLog(message.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}