const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Logs} = require('../misc/tools');

module.exports = async (bot, oldEmoji, newEmoji) => {
    try {
        if (!newEmoji.guild.me.hasPermission("MANAGE_WEBHOOKS")) return;

        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logAdd)
            .setTitle(`Emoji renamed`)
            .setFooter(`Emoji ID: ${newEmoji.id}`);

        if (newEmoji.animated) {
            embed.setDescription(`<a:${newEmoji.name}:${newEmoji.id}> ${oldEmoji.name} ➜ ${newEmoji.name}`);
        } else {
            embed.setDescription(`<:${newEmoji.name}:${newEmoji.id}> ${oldEmoji.name} ➜ ${newEmoji.name}`);
        }

        await Logs.serverLog(bot, newEmoji.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}