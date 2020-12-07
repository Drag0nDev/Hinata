const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const Sequelize = require('sequelize');
const {Timers, Server} = require('../../dbObjects');
const pm = require('parse-ms');
const tools = require('../../tools');

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
        name: 'Under construction',
        type: 'STREAMING',
        url: 'https://www.twitch.tv/zwoil'
    });

    await channel.send(embed);

    setInterval(checkMutes, 1000, bot);
};

async function checkMutes(bot) {
    const now = new Date();
    let server;
    let member;
    let muteRole

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

        console.log(muteRole)

        member.roles.remove(muteRole);
    }
}