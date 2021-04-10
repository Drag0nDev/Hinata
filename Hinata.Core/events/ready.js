const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Timers, ServerSettings, Autofeeds} = require('../misc/dbObjects');
const {Logs, Roles} = require('../misc/tools');
const reddit = require('../misc/redditAutofeed');
const autoPoster = require('topgg-autoposter');
const topgg = require('../../config.json').topgg;

module.exports = async bot => {
    let embed = new MessageEmbed()
        .setColor(bot.embedColors.ready)
        .setTitle(`${bot.user.username} online`)
        .setThumbnail(bot.user.avatarURL(
            {
                dynamic: true,
                size: 4096
            }
        ))
        .setDescription('I am online and ready to go!')
        .setTimestamp();
    let autofeeds;

    let channel = bot.channels.cache.get('762241328599269396');

    logger.info(`Logged in as ${bot.user.tag}!`);

    await bot.user.setActivity({
        name: 'on a mission with Naruto-kun',
        type: 'PLAYING'
    });

    autofeeds = await Autofeeds.findAll({
        group: ['subreddit']
    });

    autofeeds.forEach(autofeed => {
        const {subreddit} = autofeed;
        bot.subreddits.push(subreddit);
        reddit.run(bot, subreddit);
    });

    await channel.send(embed);

    try {
        setInterval(checkMutes, 1000, bot);
        setInterval(checkBans, 1000, bot);
    } catch (error) {
        logger.error(error);
    }

    //post bot stats to top.gg
    const ap = new autoPoster(topgg.token, bot);
};

async function checkMutes(bot) {
    const now = new Date();
    let server;
    let member;
    let moderator;
    let muteRole;

    await Timers.findAll({
        where: {
            type: 'Mute'
        }
    }).then(timers => {
        timers.forEach(timer => {
            const diff = now.getTime() - parseInt(timer.expiration);

            if (diff >= 0) {
                Timers.destroy({
                    where: {
                        id: timer.id
                    }
                });

                server = bot.guilds.cache.get(timer.guildId);
                member = server.members.cache.get(timer.userId);
                moderator = server.members.cache.get(timer.moderatorId);
            }
        });
    });

    if (!member) return;
    if (!server) return;

    await ServerSettings.findOne({
        where: {
            serverId: server.id
        }
    }).then(serverDb => {
        muteRole = server.roles.cache.get(serverDb.muteRoleId);
    });

    await Roles.removeRole(member, muteRole);

    const logEmbed = new MessageEmbed().setTitle('User unmuted')
        .setColor(bot.embedColors.moderations.unban)
        .setDescription(`**Member:** ${member.user.tag}\n` +
            `**Reason:** Automatic unmute from mute made by ${moderator.user.tag}\n` +
            `**Responsible Moderator:** ${moderator.user.tag}`)
        .setFooter(`ID: ${member.user.id}`)
        .setTimestamp();

    await Logs.modlog(bot, member, logEmbed);
}

async function checkBans(bot) {
    const now = new Date();
    let server;
    let member;
    let id;
    let moderator;

    await Timers.findAll({
        where: {
            type: 'Ban'
        }
    }).then(timers => {
        timers.forEach(timer => {
            const diff = now.getTime() - parseInt(timer.expiration);

            if (diff >= 0) {
                Timers.destroy({
                    where: {
                        id: timer.id
                    }
                });

                server = bot.guilds.cache.get(timer.guildId);
                id = timer.userId;
                moderator = server.members.cache.get(timer.moderatorId);
            }
        });
    });

    if (!server) return;

    await server.fetchBans()
        .then(banList => {
            member = banList.get(id);
        });

    await server.members.unban(id);

    const logEmbed = new MessageEmbed().setTitle('User unbanned')
        .setColor(bot.embedColors.moderations.unban)
        .setDescription(`**Member:** ${member.user.tag}\n` +
            `**Reason:** Automatic unmute from mute made by ${moderator.user.tag}\n` +
            `**Responsible Moderator:** ${moderator.user.tag}`)
        .setFooter(`ID: ${member.user.id}`)
        .setTimestamp();

    await Logs.modlog(bot, moderator, logEmbed);
}