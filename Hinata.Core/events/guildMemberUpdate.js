const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Compare, Logs} = require('../misc/tools');

module.exports = async (bot, oldMember, newMember) => {
    try {
        if (newMember.guild.me.hasPermission("MANAGE_WEBHOOKS")) return;
        await updateCheck(bot, oldMember, newMember);
    } catch (err) {
        logger.error(err);
    }
}

async function updateCheck(bot, oldMember, newMember) {
    //changes to the member in the server
    if (!Compare.arrayEquals(newMember._roles, oldMember._roles)) await roleChange(bot, oldMember, newMember);
    if (oldMember.nickname !== newMember.nickname) await nicknameChange(bot, oldMember, newMember);
}

async function roleChange(bot, oldMember, newMember) {
    let embed = new MessageEmbed().setTimestamp()
        .setAuthor(`${newMember.user.username}#${newMember.user.discriminator}`,
            newMember.user.avatarURL({dynamic: true}),
            newMember.user.avatarURL({
                dynamic: true,
                size: 4096
            }))
        .setFooter(`ID: ${newMember.user.id}`);
    let newRoles = [];
    let removedRoles = [];

    newMember._roles.forEach(roleId => {
        if (!oldMember._roles.includes(roleId))
            newRoles.push(`<@&${roleId}>`);
    });

    oldMember._roles.forEach(roleId => {
        if (!newMember._roles.includes(roleId))
            removedRoles.push(`<@&${roleId}>`);
    });

    if (newRoles.length > 1 && removedRoles.length === 0) {
        embed.setTitle('Roles added')
            .addField('New roles', newRoles.join(' '))
            .setColor(bot.embedColors.logs.logAdd);
    } else if (newRoles.length > 0 && removedRoles.length > 0) {
        embed.setTitle('Roles updated')
            .addField('New roles', newRoles.join(' '))
            .addField('Removed roles', removedRoles.join(' '))
            .setColor(bot.embedColors.logs.logChange);
    } else if (newRoles.length === 0 && removedRoles.length > 1) {
        embed.setTitle('Roles removed')
            .addField('removed roles', removedRoles.join(' '))
            .setColor(bot.embedColors.logs.logRemove);
    } else if (newRoles.length === 1 && removedRoles.length === 0) {
        embed.setTitle('Role added')
            .addField('New role', newRoles.join(' '))
            .setColor(bot.embedColors.logs.logAdd);
    } else {
        embed.setTitle('Role removed')
            .addField('removed role', removedRoles.join(' '))
            .setColor(bot.embedColors.logs.logRemove);
    }

    await Logs.memberLog(bot, newMember, embed);
}

async function nicknameChange(bot, oldMember, newMember) {
    let embed = new MessageEmbed().setTimestamp()
        .setAuthor(`${newMember.user.username}#${newMember.user.discriminator}`,
            newMember.user.avatarURL({dynamic: true}),
            newMember.user.avatarURL({dynamic: true, size: 4096}))
        .setFooter(`ID: ${newMember.user.id}`);

    if (oldMember.nickname === null) {
        embed.setTitle('Nickname added')
            .addField('New nickname', newMember.nickname)
            .setColor(bot.embedColors.logs.logAdd);
    } else if (newMember.nickname === null) {
        embed.setTitle('Nickname removed')
            .addField('Removed nickname', oldMember.nickname)
            .setColor(bot.embedColors.logs.logRemove);
    } else {
        embed.setTitle('Nickname changed')
            .addField('Previous nickname', oldMember.nickname)
            .addField('New nickname', newMember.nickname)
            .setColor(bot.embedColors.logs.logChange);
    }

    await Logs.memberLog(bot, newMember, embed);
}