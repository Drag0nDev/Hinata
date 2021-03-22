const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Logs, Compare, Minor} = require("../misc/tools");

module.exports = async (bot, oldRole, newRole) => {
    try {
        if (newRole.guild.me.hasPermission("MANAGE_WEBHOOKS")) return;

        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logChange)
            .setTitle(`Role "${oldRole.name}" updated`)
            .setFooter(`Role ID: ${newRole.id}`);

        //check other changes
        await checkOtherChanges(oldRole, newRole, embed);
        //check changed perms
        await checkPermissions(oldRole, newRole, embed);

        if (embed.fields.length === 0) return;

        await Logs.serverLog(bot, newRole.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}

async function checkOtherChanges(oldRole, newRole, embed) {
    const changes = Changes(oldRole, newRole);

    if (changes.newValues === '' && changes.oldValues === '') return;

    embed.addField('Old', changes.oldValues, true)
        .addField('New', changes.newValues, true);
}

async function checkPermissions(oldRole, newRole, embed) {
    let oldPermissions = Array.from(newRole.permissions);
    let newPermissions = Array.from(oldRole.permissions);

    //check difference
    if (!Compare.arrayEquals(oldPermissions, newPermissions)) {
        const changedPerms = await findChangedPerms(oldPermissions, newPermissions);

        if (changedPerms.addedPermissions.length === 0)
            embed.addField(`Changed permissions`,
                `**Removed:** ${changedPerms.removedPermissions.join(', ')}`);
        else if (changedPerms.removedPermissions.length === 0)
            embed.addField(`Changed permissions`,
                `**Added:** ${changedPerms.addedPermissions.join(', ')}`);
        else
            embed.addField(`Changed permissions`,
                `**added:** ${changedPerms.addedPermissions.join(', ')}\n` +
                `**Removed:** ${changedPerms.removedPermissions.join(', ')}`);
    }
}

function Changes(oldRole, newRole) {
    let old = '';
    let $new = '';

    if (oldRole.name !== newRole.name) {
        old += `**Name:** ${oldRole.name}\n`;
        $new += `**Name:** ${newRole.name}\n`;
    }
    if (oldRole.color !== newRole.color) {
        old += `**Color:** ${Minor.getHex(oldRole)}\n`;
        $new += `**Color:** ${Minor.getHex(newRole)}\n`;
    }
    if (oldRole.mentionable !== newRole.mentionable) {
        old += `**Mentionable:** ${oldRole.mentionable ? 'Yes' : 'No'}\n`;
        $new += `**Mentionable:** ${newRole.mentionable ? 'Yes' : 'No'}\n`;
    }
    if (oldRole.hoist !== newRole.hoist) {
        old += `**Separated:** ${oldRole.hoist ? 'Yes' : 'No'}\n`;
        $new += `**Separated:** ${newRole.hoist ? 'Yes' : 'No'}\n`;
    }

    return {
        oldValues: old,
        newValues: $new
    };
}

async function findChangedPerms(oldPerms, newPerms) {
    const repl = new RegExp('_', 'g');
    let added = [];
    let removed = [];

    //added permissions
    newPerms.forEach(permission => {
        if (!oldPerms.includes(permission)) {
            let perm = permission.toLowerCase();
            perm = perm.replace(repl, ' ');
            removed.push(perm);
        }
    });

    //removed permissions
    oldPerms.forEach(permission => {
        if (!newPerms.includes(permission)) {
            let perm = permission.toLowerCase();
            perm = perm.replace(repl, ' ');
            added.push(perm);
        }
    });

    return {
        addedPermissions: added,
        removedPermissions: removed
    };
}