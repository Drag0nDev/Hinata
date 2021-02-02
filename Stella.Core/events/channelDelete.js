const {MessageEmbed} = require('discord.js');
const logger = require("log4js").getLogger();
const tools = require('../misc/tools');

module.exports = async (bot, channel) => {
    try {
        const type = channel.type.charAt(0).toUpperCase() + channel.type.slice(1);
        const category = channel.guild.channels.cache.get(channel.parentID);

        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logRemove)
            .setTitle(`${type} channel deleted`)
            .setFooter(`Channel ID: ${channel.id}`)
            .addField('Name', channel.name, true)
            .addField('Category', !category ? 'No category' : category.name, true);

        await tools.serverLog(channel.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}