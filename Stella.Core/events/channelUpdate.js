const {MessageEmbed} = require('discord.js');
const logger = require("log4js").getLogger();
const tools = require('../misc/tools');

module.exports = async (bot, oldChannel, newChannel) => {
    const repl = new RegExp('_', 'g');
    try {
        const type = newChannel.type.charAt(0).toUpperCase() + newChannel.type.slice(1);
        let embed = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.logChange)
            .setTitle(`${type} channel updated`)
            .setFooter(`Channel ID: ${newChannel.id}`);

        if (newChannel.rawPosition !== oldChannel.rawPosition) return;

        //check for a change in permissions
        await checkPermissions(oldChannel, newChannel, embed);
        //check for name change
        await checkNamechange(oldChannel, newChannel, embed);
        //check for category change
        await checkCategorychange(oldChannel, newChannel, embed);

        await tools.serverLog(newChannel.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}

async function checkPermissions(oldChannel, newChannel, embed) {
    let newKeys = Array.from(newChannel.permissionOverwrites.keys());
    let oldKeys = Array.from(oldChannel.permissionOverwrites.keys());

    if (!tools.arrayEquals(newKeys, oldKeys)) {
        if (newKeys.length > oldKeys.length) {
            newKeys.forEach(key => {
                if (!oldKeys.includes(key)) {
                    const newPermissions = newChannel.permissionOverwrites.get(key);
                    const role = newChannel.guild.roles.cache.get(newPermissions.id);
                    const member = newChannel.guild.members.cache.get(newPermissions.id);

                    if (!role) {
                        embed.setDescription(`**New permission overwrites set for <@!${member.user.id}> in <#${newChannel.id}>**`);
                    } else {
                        embed.setDescription(`**New permission overwrites set for <@&${role.id}> in <#${newChannel.id}>**`);
                    }
                }
            });
        } else {
            oldKeys.forEach(key => {
                if (!newKeys.includes(key)) {
                    const oldPermissions = oldChannel.permissionOverwrites.get(key);
                    const role = newChannel.guild.roles.cache.get(oldPermissions.id);
                    const member = newChannel.guild.members.cache.get(oldPermissions.id);

                    if (!role) {
                        embed.setDescription(`**Permission overwrites removed for <@!${member.user.id}> in <#${newChannel.id}>**`);
                    } else {
                        embed.setDescription(`**Permission overwrites removed for <@&${role.id}> in <#${newChannel.id}>**`);
                    }
                }
            })
        }
    } else {
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
    }
}

async function checkNamechange(oldChannel, newChannel, embed) {
    if (oldChannel.name !== newChannel.name) {
        embed.addField('Before', oldChannel.name, true)
            .addField('After', newChannel.name, true);
    }
}

async function checkCategorychange(oldChannel, newChannel, embed) {
    if (newChannel.parentID !== oldChannel.parentID) {
        let oldCat = oldChannel.guild.channels.cache.get(oldChannel.parentID);
        let newCat = newChannel.guild.channels.cache.get(newChannel.parentID);

        embed.setDescription(`**<#${newChannel.id}> changed category**`)
            .addField('Old', oldCat.name, true)
            .addField('New', !newCat ? 'No category' : newCat.name, true);
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