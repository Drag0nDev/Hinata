const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const Sequelize = require('sequelize');
const {Timers, Server} = require('../misc/dbObjects');
const pm = require('parse-ms');
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

    setInterval(checkMutes, 1000, bot);
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

    if (server) {
        await Server.findOne({
            where: {
                serverId: server.id
            }
        }).then(serverDb => {
            muteRole = server.roles.cache.get(serverDb.muteRoleId);
        });

        await member.roles.remove(muteRole);

        const logEmbed = new MessageEmbed().setTitle('User unmuted')
            .setColor(bot.embedColors.unban)
            .setDescription(`**Member:** ${member.user.tag}\n` +
                `**Reason:** Automatic unmute from mute made by ${moderator.user.tag}\n` +
                `**Responsible Moderator:** ${moderator.user.tag}`)
            .setFooter(`ID: ${member.user.id}`)
            .setTimestamp();

        await tools.modlog(member, logEmbed);
    }
}