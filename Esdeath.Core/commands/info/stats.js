const {MessageEmbed} = require('discord.js');
const config = require("../../../config.json");
const pm = require('pretty-ms');
const log4js = require("log4js");

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'stats',
    category: 'info',
    description: 'Get the bot statistics',
    usage: '[command | alias]',
    //</editor-fold>
    run: async (bot, message) => {
        const logger = log4js.getLogger();
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);

        //get bot stats
        let botName = `${bot.user.username}#${bot.user.discriminator}`;
        let creationDate = getDate(bot.user.createdTimestamp);
        let botId = bot.user.id;
        let uptime = pm(bot.uptime, {
            verbose: true,
        });
        let avatar = bot.user.avatarURL({
            size: 4096,
            dynamic: true
        });

        //get bot developer info
        let dev = bot.users.cache.get(config.owner);
        let devTag = `${dev.username}#${dev.discriminator}`;
        let devId = `${dev.id}`;

        //other info
        let cmdServerName = message.guild.name;
        //all the links to the support server and invite links
        let inviteLink;
        let supportServer = 'https://discord.gg/ReBJ4AB';
        bot.generateInvite({
            permissions: ["ADMINISTRATOR"]
        }).then(link => {
            inviteLink = link.toString();
            let links = `• [**Join my support sever!** - Join if you need extra help!](${supportServer})\n` +
                `• [**My invite link** - It's always fun with my in the server!](${inviteLink})`;

            embed.setAuthor(botName, avatar)
                .setColor(bot.embedColors.normal)
                .setThumbnail(avatar)
                .setFooter(`© 2020-2020 Copyright: ${devTag}`)
                .addField(`Author`, devTag, true)
                .addField(`Bot ID`, botId, true)
                .addField(`Developer ID`, devId, true)
                .addField(`Bot creation day`, creationDate, true)
                .addField(`In server`, cmdServerName, true)
                .addField(`Uptime`, uptime, true)
                .addField(`Links`, links, false);

            message.channel.send(embed);
        }).catch(err => {
            logger.error(err);
        })
    }
}

function getDate(timestamp) {
    let date = new Date(timestamp);

    let months = date.getMonth() + 1;
    let days = date.getUTCDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';

    months = months < 10 ? '0' + months : months;
    days = days < 10 ? '0' + days : days;
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    let time = hours + ':' + minutes + ':' + seconds + ' ' + ampm;

    return `${date.getFullYear()}/${months}/${days}\n${time}`;
}