const logger = require("log4js").getLogger();
const {ServerSettings} = require('../misc/dbObjects');
const {MessageEmbed} = require('discord.js');
const tools = require('../misc/tools');
const pm = require('pretty-ms');

module.exports = async (bot, member) => {
    await sendLeaveMessage(member);
    await joinleaveLog(bot, member);
    await checkKick(bot, member);
};

async function checkKick(bot, member) {
    let embed = new MessageEmbed().setTimestamp();
    let date = new Date();

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

    if (executor.bot)
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
}

async function sendLeaveMessage(member) {
    const guild = member.guild;

    await ServerSettings.findOne({
        where: {
            serverId: guild.id
        }
    }).then(async settings => {
        if (!settings.leaveMessageChannel || !settings.leaveMessage) return;

        let leaveMessage = settings.leaveMessage;
        let LeaveChannel = guild.channels.cache.get(settings.leaveMessageChannel);

        leaveMessage = await tools.customReplace(guild, leaveMessage, member);

        try {
            let embed = new MessageEmbed();
            const jsonEmbed = JSON.parse(leaveMessage);

            if (jsonEmbed.color) embed.setColor(jsonEmbed.color);
            if (jsonEmbed.title) embed.setTitle(jsonEmbed.title);
            if (jsonEmbed.description) embed.setDescription(jsonEmbed.description);
            if (jsonEmbed.thumbnail) embed.setThumbnail(jsonEmbed.thumbnail);
            if (jsonEmbed.fields) {
                for (let field of jsonEmbed.fields) {
                    let name = field.name;
                    let value = field.value;
                    let inline;
                    if (field.inline) inline = field.inline;
                    else inline = false;

                    embed.addField(name, value, inline);
                }
            }

            await LeaveChannel.send({embed: embed});
        } catch (err) {
            LeaveChannel.send(leaveMessage);
        }
    });
}

async function joinleaveLog(bot, member) {
    const date = new Date();
    const joinTime = member.joinedTimestamp;
    let age = date.getTime() - joinTime;

    let agestr = pm(age, {
        verbose: true,
    });

    let roleStr = tools.getRoles(member);

    let embed = new MessageEmbed().setTitle('Member left')
        .setTimestamp()
        .setColor(bot.embedColors.leave)
        .setAuthor(`${member.user.username}#${member.user.discriminator}`, member.user.avatarURL({dynamic: true}), member.user.avatarURL({dynamic: true, size: 4096}))
        .setDescription(`<@!${member.user.id}> left the server`)
        .addField(`Membercount`, member.guild.memberCount, true)
        .addField('Time in server', agestr, true)
        .addField('Roles', roleStr, true)
        .setFooter(`ID: ${member.user.id}`);

    await tools.joinLeaveLog(member, embed);
}

function isClose(logTime, programTime) {
    let logDate = new Date(logTime);
    let diff = programTime - logDate;

    return diff > 1000
}