const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const tools = require("../misc/tools");

module.exports = async (bot, emoji) => {
    try {
        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logAdd)
            .setTitle(`Emoji deleted`)
            .setFooter(`Emoji ID: ${emoji.id}`)
            .setDescription(`${emoji.name}`);

        await tools.serverLog(emoji.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}