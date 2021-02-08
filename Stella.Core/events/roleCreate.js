const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Logs} = require("../misc/tools");

module.exports = async (bot, role) => {
    try {
        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logAdd)
            .setTitle(`Role created`)
            .setFooter(`Role ID: ${role.id}`)
            .addField('Name', role.name, true)
            .addField('Color', tools.getHex(role), true)
            .addField('Mentionable', role.mentionable ? 'Yes' : 'No', true)
            .addField('Displayed separetly', role.hoist ? 'Yes' : 'No', true);

        await Logs.serverLog(role.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}