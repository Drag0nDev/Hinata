const {MessageEmbed} = require('discord.js');
const config = require("../../../config.json");
const version = require('../../../package.json').version;
const pm = require('pretty-ms');
const logger = require("log4js").getLogger();
const {Dates} = require("../../misc/tools");

module.exports = {
    name: 'stats',
    category: 'info',
    description: 'Get the bot statistics',

    usage: '[command | alias]',
    examples: ['h!stats'],
    cooldown: 10,
    run: async (bot, message) => {
        const stat = {
            send: async (msg) => {
                return message.channel.send(msg);
            },
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal),
            date: new Date(),
            supportServer: 'https://discord.gg/ReBJ4AB',
            bot: {
                botName: `${bot.user.username}#${bot.user.discriminator}`,
                creationDate: Dates.getDate(bot.user.createdTimestamp),
                botId: bot.user.id,
                uptime: pm(bot.uptime, {
                    verbose: true,
                }),
                avatar: bot.user.avatarURL({
                    size: 4096,
                    dynamic: true
                })
            },
            dev: {
                dev: await bot.users.cache.get(config.owner)
            },
            fields: []
        }

        //get bot developer info
        stat.fields.push(
            {
                name: 'Author',
                value: `${stat.dev.dev.username}#${stat.dev.dev.discriminator}`,
                inline: true
            },
            {
                name: 'Bot ID',
                value: stat.bot.botId,
                inline: true
            },
            {
                name: 'Developer ID',
                value: stat.dev.dev.id,
                inline: true
            },
            {
                name: 'Bot creation day',
                value: stat.bot.creationDate,
                inline: true
            },
            {
                name: 'In server',
                value: message.guild.name,
                inline: true
            },
            {
                name: 'Uptime',
                value: stat.bot.uptime,
                inline: true
            }
        );

        bot.generateInvite({
            permissions: ["ADMINISTRATOR"]
        })
            .then(link => {
            stat.fields.push({
                name: 'Links',
                value: `• [**Join my support sever!** - Join if you need extra help!](${stat.supportServer})\n` +
                    `• [**My invite link** - It's always fun with me in the server!](${link.toString()})`
            });

            stat.embed.setAuthor(stat.botName, stat.avatar)
                .setColor(bot.embedColors.embeds.normal)
                .setThumbnail(stat.bot.avatar)
                .setFooter(`© 2020-${stat.date.getFullYear()} Copyright: ${stat.dev.dev.username}#${stat.dev.dev.discriminator}\nVersion: ${version.version}`)
                .addFields(stat.fields);

            stat.send(stat.embed);
        })
            .catch(err => {
            logger.error(err);
        })
    }
}