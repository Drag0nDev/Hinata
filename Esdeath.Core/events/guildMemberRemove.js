const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');


module.exports = async (bot, member) => {
    let embed = new MessageEmbed().setTimestamp()
    const channel = bot.channels.cache.find(channel => channel.id === '763039768870649856');

    //get current date timestamp
    let date = new Date();

    const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_KICK',
    }).catch(err => {
            logger.error(err);
        }
    );

    const kickLog = fetchedLogs.entries.first();

    if (
        !kickLog ||
        kickLog.createdTimestamp !== date.getTime()
    )
        return console.log(`${member.user.tag} left the guild, most likely of their own will.`);

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

    await channel.send(embed);
};

function GetTimestamp(date){
    return ((date.getMonth() + 1) + '/' + (date.getDate()) + '/' + date.getFullYear() + " " + date.getHours() + ':' + ((date.getMinutes() < 10) ? ("0" + date.getMinutes()) : (date.getMinutes())) + ':' + ((date.getSeconds() < 10) ? ("0" + date.getSeconds()) : (date.getSeconds())));
}