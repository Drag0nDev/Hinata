const {MessageEmbed} = require('discord.js');
const logger = require("log4js").getLogger();
const tools = require('../misc/tools');

module.exports = async (bot, channel) => {
    const repl = new RegExp('_', 'g');
    try {
        const type = channel.type.charAt(0).toUpperCase() + channel.type.slice(1);
        const category = channel.guild.channels.cache.get(channel.parentID);

        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logAdd)
            .setTitle(`${type} channel created`)
            .setFooter(`Channel ID: ${channel.id}`)
            .addField('Name', channel.name, true)
            .addField('Category', !category ? 'No category' : category.name, true);

        let keys = Array.from(channel.permissionOverwrites.keys());

        for (let i = 0; i < channel.permissionOverwrites.size; i++) {
            const permissions = channel.permissionOverwrites.get(keys[i]);
            const allowed = permissions.allow.toArray();
            const deny = permissions.deny.toArray();
            const role = channel.guild.roles.cache.get(permissions.id);
            let perms = '';

            //allowed permissions
            if (allowed.length > 0) {
                for (let permission of allowed) {
                    let perm = permission.charAt(0) + permission.slice(1).toLowerCase();
                    perm = perm.replace(repl, ' ');
                    perms += `**${perm}:** ✅\n`
                }
            }

            if (deny.length > 0) {
                for (let permission of deny) {
                    let perm = permission.charAt(0) + permission.slice(1).toLowerCase();
                    perm = perm.replace(repl, ' ');
                    perms += `**${perm}:** ❌\n`
                }
            }

            embed.addField(`Role override for ${role.name}`, perms)
        }

        await tools.serverLog(channel.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}