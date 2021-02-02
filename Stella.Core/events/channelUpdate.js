const {MessageEmbed} = require('discord.js');
const logger = require("log4js").getLogger();
const tools = require('../misc/tools');

module.exports = async (bot, oldChannel, newChannel) => {
    const repl = new RegExp('_', 'g');
    try {
        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logChange)
            .setTitle(`${newChannel.name} updated`)
            .setFooter(`Channel ID: ${newChannel.id}`);

        //check for a change in permissions
        await checkPermissions(oldChannel, newChannel, embed);

        //check for name change
        await checkNamechange(oldChannel, newChannel, embed);
    } catch (err) {
        logger.error(err);
    }
}

async function checkPermissions(oldChannel, newChannel, embed) {
    let newKeys = Array.from(newChannel.permissionOverwrites.keys());
    let oldKeys = Array.from(oldChannel.permissionOverwrites.keys());

    for (let i = 0; i < newChannel.permissionOverwrites.size; i++) {
        const newPermissions = newChannel.permissionOverwrites.get(newKeys[i]);
        const oldPermissions = oldChannel.permissionOverwrites.get(oldKeys[i]);
        const newAllowed = newPermissions.allow.toArray();
        const oldAllowed = oldPermissions.allow.toArray();
        const newDenied = newPermissions.deny.toArray();
        const oldDenied = oldPermissions.deny.toArray();
        const role = newChannel.guild.roles.cache.get(newPermissions.id);
        const member = newChannel.guild.members.cache.get(newPermissions.id);
        let changedPerms = '';

        //allowed permissions
        if (!tools.arrayEquals(newAllowed, oldAllowed) || !tools.arrayEquals(newDenied, oldDenied)) {
            changedPerms = findChangedPerms(newAllowed, oldAllowed, newDenied, oldDenied);
            if (newPermissions.type === 'role')
                embed.addField(`Role override for ${role.name} updated in ${newChannel.name}`, changedPerms);
            else
                embed.addField(`Role override for ${member.user.username}#${member.user.discriminator} updated in ${newChannel.name}`, changedPerms);
        }
    }

    await tools.serverLog(newChannel.guild, embed);
}

async function checkNamechange(oldChannel, newChannel, embed) {
    if (oldChannel.name !== newChannel.name) {
        embed.addField('Before', oldChannel.name, true)
            .addField('After', newChannel.name, true);

        await tools.serverLog(newChannel.guild, embed);
    }
}

function findChangedPerms(newAllowed, oldAllowed, newDenied, oldDenied) {
    const repl = new RegExp('_', 'g');
    let changedPerms = '';

    //check for allowed/removed or added permissions
    for (let newAllow of newAllowed) {
        if (!oldAllowed.includes(newAllow)) {
            if (oldDenied.includes(newAllow)) {
                let perm = newAllow.charAt(0) + newAllow.slice(1).toLowerCase()
                perm = perm.replace(repl, ' ');
                changedPerms += `**${perm}:** ❌ ➜ ✅\n`;
            }
            else {
                let perm = newAllow.charAt(0) + newAllow.slice(1).toLowerCase()
                perm = perm.replace(repl, ' ');
                changedPerms += `**${perm}:** ⬜ ➜ ✅\n`;
            }
        }
    }

    for (let oldAllow of oldAllowed) {
        if (!newAllowed.includes(oldAllow)) {
            if (newDenied.includes(oldAllow)) {
                let perm = oldAllow.charAt(0) + oldAllow.slice(1).toLowerCase()
                perm = perm.replace(repl, ' ');
                changedPerms += `**${perm}:** ✅ ➜ ❌\n`;
            }
            else {
                let perm = oldAllow.charAt(0) + oldAllow.slice(1).toLowerCase()
                perm = perm.replace(repl, ' ');
                changedPerms += `**${perm}:** ✅ ➜ ⬜\n`;
            }
        }
    }

    for (let newDeny of newDenied) {
        if (!oldDenied.includes(newDeny)) {
            if (!oldAllowed.includes(newDeny)) {
                let perm = newDeny.charAt(0) + newDeny.slice(1).toLowerCase()
                perm = perm.replace(repl, ' ');
                changedPerms += `**${perm}:** ⬜ ➜ ❌\n`;
            }
        }
    }

    for (let oldDeny of oldDenied) {
        if (!newDenied.includes(oldDeny)) {
            if (!newAllowed.includes(oldDeny)) {
                let perm = oldDeny.charAt(0) + oldDeny.slice(1).toLowerCase()
                perm = perm.replace(repl, ' ');
                changedPerms += `**${perm}:** ❌ ➜ ⬜\n`;
            }
        }
    }

    return changedPerms;
}