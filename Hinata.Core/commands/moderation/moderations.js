const neededPerm = ['KICK_MEMBERS'];
const {MessageEmbed} = require("discord.js");
const {Timers, User, Server} = require('../../misc/dbObjects');
const {Permissions, Minor} = require('../../misc/tools');
const pm = require('pretty-ms');
const logger = require("log4js").getLogger();

module.exports = {
    name: 'moderations',
    category: 'moderation',
    description: 'This command shows the timed moderations that are currently active in the server',
    usage: '[command | alias]',
    examples: ['h!moderations'],
    neededPermissions: neededPerm,
    run: async (bot, message) => {
        const moderations = {
            send: async (msg) => {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setFooter('Page 1')
        };

        moderations.embed.setTitle(`Moderations`)
            .setThumbnail(message.guild.iconURL({
                dynamic: true,
                size: 4096
            }));
        moderations.now = new Date();

        moderations.timers = await Timers.findAll({
                where: {
                    guildId: message.guild.id
                },
                order: [
                    ['expiration', 'ASC'],
                ]
            }
        ).catch(async err => {
            logger.error(err);
            await moderations.embed.setColor(bot.embedColors.embeds.error)
                .setDescription(`Please contact the bot developer to resolve the error that occured!\n` +
                    `error: **${err}**`)
                .setTimestamp();

            await moderations.send(moderations.embed);
        });

        if (!moderations.timers[0])
            return moderations.send(moderations.embed.setDescription('No moderations in this server!')
                .setColor(bot.embedColors.embeds.normal)
                .setTimestamp());

        for (let i = 0; i < 5 && i < moderations.timers.length; i++) {
            const timer = moderations.timers[i];
            let user;
            let moderator;

            user = await User.findOne({
                where: {
                    userId: timer.userId
                }
            });

            moderator = await User.findOne({
                where: {
                    userId: timer.moderatorId
                }
            });

            let timeLeft;
            await timediff(moderations.now, timer.expiration).then(left => timeLeft = left);

            moderations.embed.addField(
                `${timer.type}: ${user.userTag}`,
                `**Reason**: ${timer.reason}\n` +
                `**Moderator**: ${moderator.userTag}\n` +
                `**Time left**: ${timeLeft}`,
                false
            );
        }

        moderations.server = await Server.findOne({
            where: {
                serverId: message.guild.id
            }
        });

        moderations.description = `All warnings for server **${moderations.server.serverName}**.`;
        await moderations.embed.setColor(bot.embedColors.embeds.normal)
            .setDescription(moderations.description)
            .setTimestamp();

        messageEditor(bot, message, moderations.embed, moderations.timers, moderations.description, moderations.now);
    }
}

function messageEditor(bot, message, embed, timers, description, now) {
    message.channel.send(embed)
        .then(async messageBot => {
            await Minor.addPageArrows(messageBot);
            let page = 0;

            const filter = (reaction, user) => {
                return (reaction.emoji.name === '◀' || reaction.emoji.name === '▶') && user.id === message.author.id;
            };

            const collector = messageBot.createReactionCollector(filter, {time: 60000});

            collector.on('collect', async (reaction, user) => {
                let editEmbed = new MessageEmbed()
                    .setTitle(`Moderations`)
                    .setThumbnail(message.guild.iconURL({
                        dynamic: true,
                        size: 4096
                    }))
                    .setDescription(description)
                    .setColor(bot.embedColors.embeds.normal)
                    .setTimestamp();

                if (reaction.emoji.name === '▶') {
                    page++;
                    await pageEmbed(message, page, timers, editEmbed, now);
                } else if (reaction.emoji.name === '◀') {
                    page--;
                    if (page < 0)
                        return;
                    await pageEmbed(message, page, timers, editEmbed, now);
                }

                if (editEmbed.fields.length !== 0) {
                    await messageBot.edit(editEmbed);
                }
            });

            collector.on('end', collected => {
                messageBot.reactions.removeAll()
                    .catch(error => {
                        if (error.message === "Missing Permissions") {
                            return;
                        }
                        logger.error(error.message, 'in server', message.guild.name);
                    });
            });
        });
}

async function pageEmbed(message, page, timers, editEmbed, now) {
    for (let i = 5 * page; (i < 5 + (5 * page)) && (i < timers.length); i++) {
        const timer = timers[i];
        let user;
        let moderator;

        user = await User.findOne({
            where: {
                userId: timer.userId
            }
        });

        moderator = await User.findOne({
            where: {
                userId: timer.moderatorId
            }
        });

        let timeLeft;
        await timediff(now, timer.expiration).then(left => timeLeft = left);

        embed.addField(
            `${timer.type}: ${user.userTag}`,
            `**Reason**: ${timer.reason}\n` +
            `**Moderator**: ${moderator.userTag}\n` +
            `**Time left**: ${timeLeft}`,
            false
        );
    }

    editEmbed.setFooter(`Page ${page + 1}`);
}

async function timediff(now, expiration) {
    return pm(parseInt(expiration) - now.getTime(), {
        verbose: true
    });
}