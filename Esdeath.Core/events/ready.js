const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const Sequelize = require('sequelize');

module.exports = async bot => {
    let embed = new MessageEmbed()
        .setColor(bot.embedColors.ready)
        .setTitle('Esdeath online')
        .setThumbnail(bot.user.avatarURL(
            {
                dynamic: true,
                size: 4096
            }
        ))
        .setDescription('I am online and ready to go!')
        .setImage('https://i.imgur.com/mkyqHQW.gif')
        .setTimestamp();

    let channel = bot.channels.cache.get('762241328599269396');

    logger.info(`Logged in as ${bot.user.tag}!`);

    await bot.user.setActivity({
        name: 'Under construction',
        type: 'STREAMING',
        url: 'https://www.twitch.tv/zwoil'
    });

    channel.send(embed);
};