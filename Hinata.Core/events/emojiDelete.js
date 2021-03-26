const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Logs} = require('../misc/tools');

module.exports = async (bot, emoji) => {
    try {
        if (!emoji.guild.me.hasPermission("MANAGE_WEBHOOKS")) return;

        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logs.logAdd)
            .setTitle(`Emoji deleted`)
            .setFooter(`Emoji ID: ${emoji.id}`)
            .setDescription(`${emoji.name}`);

        await Logs.serverLog(bot, emoji.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}