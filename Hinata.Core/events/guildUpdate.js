const {MessageEmbed} = require('discord.js');
const logger = require("log4js").getLogger();
const {Logs} = require('../misc/tools');

module.exports = async (bot, oldGuild, newGuild) => {
    try {
        if (newGuild.me.hasPermission("MANAGE_WEBHOOKS")) return;
        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logs.logChange)
            .setTitle(`Server updated`);
        let before = '';
        let after = '';

        //check for updated name
        if (oldGuild.name !== newGuild.name) {
            before += `**Name:** ${oldGuild.name}\n`;
            after += `**Name:** ${newGuild.name}\n`;
        }

        //check for updated region
        if (oldGuild.region !== newGuild.region) {
            before += `**Region:** ${oldGuild.region}\n`;
            after += `**Region:** ${newGuild.region}\n`;
        }

        //check for updated afk channel
        if (oldGuild.afkChannelID !== newGuild.afkChannelID) {
            let oldAFK = newGuild.channels.cache.get(oldGuild.afkChannelID);
            let newAFK = newGuild.channels.cache.get(newGuild.afkChannelID);

            before += `**AFK channel:** ${!oldAFK ? 'No channel' : oldAFK.name}\n`;
            after += `**AFK channel:** ${!newAFK ? 'No channel' : newAFK.name}\n`;
        }

        //check for server verification level change
        if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
            before += `**Verification:** ${oldGuild.verificationLevel.charAt(0) + oldGuild.verificationLevel.slice(1).toLowerCase()}\n`;
            after += `**Verification:** ${newGuild.verificationLevel.charAt(0) + newGuild.verificationLevel.slice(1).toLowerCase()}\n`;
        }

        //check for new server icon
        if (oldGuild.icon !== newGuild.icon) {
            embed.setImage(newGuild.iconURL({
                dynamic: true,
                size: 4096
            }))
                .setDescription('**New icon**');
        }

        if (before !== '' && after !== '') {
            embed.addField('Before', before, true)
                .addField('After', after, true);
        }

        if (embed.fields.length === 0 && embed.image === null) return;

        await Logs.serverLog(bot, newGuild, embed);
    } catch (err) {
        logger.error(err);
    }
}