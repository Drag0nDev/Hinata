const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Logs} = require('../misc/tools');

module.exports = async (bot, emoji) => {
    try {
        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logAdd)
            .setTitle(`Emoji created`)
            .setFooter(`Emoji ID: ${emoji.id}`);

        if (emoji.animated) {
            embed.setDescription(`<a:${emoji.name}:${emoji.id}> ${emoji.name}`);
        } else {
            embed.setDescription(`<:${emoji.name}:${emoji.id}> ${emoji.name}`);
        }

        await Logs.serverLog(bot, emoji.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}