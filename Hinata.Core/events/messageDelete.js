const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Logs} = require("../misc/tools");

module.exports = async (bot, message) => {
    try {
        if (!message.guild.me.hasPermission("MANAGE_WEBHOOKS")) return;

        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logRemove)
            .setAuthor(`${message.author.username}#${message.author.discriminator}`,
                message.author.avatarURL({dynamic: true}),
                message.author.avatarURL({dynamic: true, size: 4096}))
            .setTitle('Message deleted')
            .setFooter(`ID: ${message.author.id}`);

        if (message.author.bot) return;

        if (message.content !== '') {
            let content;

            if (message.content.length > 1018) {
                content = `${message.content.substring(0, 1018)} \`...\``;
            } else {
                content = message.content;
            }

            embed.addField(`Message deleted in #${message.channel.name}`, content);
        }
        if (message.attachments.size > 0) {
            embed.addField('Attachement', message.attachments.first().name);
            embed.setImage(message.attachments.first().proxyURL);
        }

        await Logs.messageLog(bot, message.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}