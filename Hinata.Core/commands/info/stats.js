const {MessageEmbed} = require('discord.js');
const config = require("../../../config.json");
const pm = require('pretty-ms');
const log4js = require("log4js");
const {Dates} = require("../../misc/tools");

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="stats help">
    name: 'stats',
    category: 'info',
    description: 'Get the bot statistics',
    usage: '[command | alias]',
    examples: ['h!stats'],
    //</editor-fold>
    run: async (bot, message) => {
        const logger = log4js.getLogger();
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let date = new Date();

        //get bot stats
        let botName = `${bot.user.username}#${bot.user.discriminator}`;
        let creationDate = Dates.getDate(bot.user.createdTimestamp);
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
                `• [**My invite link** - It's always fun with me in the server!](${inviteLink})`;

            embed.setAuthor(botName, avatar)
                .setColor(bot.embedColors.normal)
                .setThumbnail(avatar)
                .setFooter(`© 2020-${date.getFullYear()} Copyright: ${devTag}`)
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