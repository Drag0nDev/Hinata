const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Timers, Server} = require('../misc/dbObjects');
const tools = require('../misc/tools');

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
        .setImage('https://i.imgur.com/QsBl85U.gif')
        .setTimestamp();

    let channel = bot.channels.cache.get('762241328599269396');

    logger.info(`Logged in as ${bot.user.tag}!`);

    await bot.user.setActivity({
        name: 'with Ikki',
        type: 'PLAYING'
    });

    await channel.send(embed);

    try {
        setInterval(checkMutes, 1000, bot);
        setInterval(checkBans, 1000, bot);
    } catch (error) {
        logger.error(error);
    }
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

    await Server.findOne({
        where: {
            serverId: server.id
        }
    }).then(serverDb => {
        muteRole = server.roles.cache.get(serverDb.muteRoleId);
    });

    await tools.removeRole(member, muteRole);

    const logEmbed = new MessageEmbed().setTitle('User unmuted')
        .setColor(bot.embedColors.unban)
        .setDescription(`**Member:** ${member.user.tag}\n` +
            `**Reason:** Automatic unmute from mute made by ${moderator.user.tag}\n` +
            `**Responsible Moderator:** ${moderator.user.tag}`)
        .setFooter(`ID: ${member.user.id}`)
        .setTimestamp();

    await tools.modlog(member, logEmbed);
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
        .setColor(bot.embedColors.unban)
        .setDescription(`**Member:** ${member.user.tag}\n` +
            `**Reason:** Automatic unmute from mute made by ${moderator.user.tag}\n` +
            `**Responsible Moderator:** ${moderator.user.tag}`)
        .setFooter(`ID: ${member.user.id}`)
        .setTimestamp();

    await tools.modlog(moderator, logEmbed);
}