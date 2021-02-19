const {MessageEmbed} = require('discord.js');
const logger = require("log4js").getLogger();
const {Logs} = require('../misc/tools');

module.exports = async (bot, channel) => {
    try {
        if (channel.type === 'dm') return;

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
            const denied = permissions.deny.toArray();
            const role = channel.guild.roles.cache.get(permissions.id);
            const member = channel.guild.members.cache.get(permissions.id);
            let perms;

            if (!role) {
                perms = getPermissions(allowed, denied);

                embed.addField(`Role override for ${member.user.username}#${member.user.discriminator}`, perms);
            } else {
                perms = getPermissions(allowed, denied);

                embed.addField(`Role override for ${role.name}`, perms);
            }

        }

        await Logs.serverLog(channel.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}

function getPermissions(allowed, denied) {
    const repl = new RegExp('_', 'g');
    let perms = '';

    //allowed permissions
    if (allowed.length > 0) {
        for (let permission of allowed) {
            let perm = permission.charAt(0) + permission.slice(1).toLowerCase();
            perm = perm.replace(repl, ' ');
            perms += `**${perm}:** ✅\n`
        }
    }

    if (denied.length > 0) {
        for (let permission of denied) {
            let perm = permission.charAt(0) + permission.slice(1).toLowerCase();
            perm = perm.replace(repl, ' ');
            perms += `**${perm}:** ❌\n`
        }
    }

    return perms;
}