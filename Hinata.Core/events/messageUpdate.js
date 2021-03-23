const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Logs} = require("../misc/tools");

module.exports = async (bot, oldMessage, newMessage) => {
    try {
        if (!newMessage.guild.me.hasPermission("MANAGE_WEBHOOKS")) return;

        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logChange)
            .setAuthor(`${newMessage.author.username}#${newMessage.author.discriminator}`,
                newMessage.author.avatarURL({dynamic: true}),
                newMessage.author.avatarURL({dynamic: true, size: 4096}))
            .setTitle(`Message edited in #${newMessage.channel.name}`)
            .setFooter(`ID: ${newMessage.author.id}`);

        if (newMessage.author.bot) return;
        if (oldMessage.content === newMessage.content) return;

        let newContent;
        let oldContent;

        if (newMessage.content.length > 1018) {
            newContent = `${newMessage.content.substring(0, 1018)} \`...\``;
        } else {
            newContent = newMessage.content;
        }

        if (oldMessage.content.length > 1018) {
            oldContent = `${oldMessage.content.substring(0, 1018)} \`...\``;
        } else {
            oldContent = oldMessage.content;
        }


        embed.addField('Old message', oldContent)
            .addField('New message', newContent);

        await Logs.messageLog(bot, newMessage.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}