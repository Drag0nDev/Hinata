const logger = require("log4js").getLogger();
const {Server} = require('../misc/dbObjects');
const {MessageEmbed} = require('discord.js');
const pm = require('pretty-ms');

module.exports = async (bot, member) => {
    let embed = new MessageEmbed().setTimestamp();
    let date = new Date();
    const modlogChannel = member.guild.channels.cache.get(await tools.getModlogChannel(member.guild.id));

    if (!modlogChannel)
        return;

    let fetchedLogs;

    try {
        fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });
    } catch (err) {
        logger.error(err);
    }


    if (!fetchedLogs)
        return;

    const kickLog = fetchedLogs.entries.first();

    if (
        !kickLog ||
        isClose(kickLog.createdTimestamp, date)
    )
        return;

    const {executor, target, reason} = kickLog;

    if (executor.id === bot.user.id)
        return;

    if (target.id === member.id) {
        embed.setTitle('User kicked')
            .setColor(bot.embedColors.kick)
            .setDescription(`**Member:** ${member.user.tag}\n` +
                `**Reason:** ${reason}\n` +
                `**Responsible moderator:** ${executor.tag}`)
            .setFooter(`ID: ${member.id}`);
    } else {
        logger.warn('Failed to load the audit log!');
    }

    await tools.modlog(member, embed);
};

function isClose(logTime, programTime) {
    let logDate = new Date(logTime);
    let diff = programTime - logDate;

    return diff > 1000
}