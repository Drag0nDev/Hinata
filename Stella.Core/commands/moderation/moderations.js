const neededPerm = ['KICK_MEMBERS'];
const {MessageEmbed} = require("discord.js");
const {Timers, User, Server} = require('../../misc/dbObjects');
const tools = require('../../misc/tools');
const pm = require('pretty-ms');
const logger = require("log4js").getLogger();

module.exports = {
    name: 'moderations',
    category: 'moderation',
    description: 'This command shows the timed moderations that are currently active in the server',
    usage: '[command | alias] [Member mention/id]',
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setFooter('Page 1');

        //check member and bot permissions
        let noUserPermission = tools.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = tools.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        embed.setTitle(`Moderations`)
            .setThumbnail(message.guild.iconURL({
                dynamic: true,
                size: 4096
            }));
        let description;
        const now = new Date();

        return await Timers.findAll({
                where: {
                    guildId: message.guild.id
                },
                order: [
                    ['expiration', 'ASC'],
                ]
            }
        ).then(async timers => {
            if (!timers[0])
                return message.channel.send(embed.setDescription('No moderations in this server!')
                    .setColor(bot.embedColors.normal)
                    .setTimestamp());

            for (let i = 0; i < 5 && i < timers.length; i++) {
                const timer = timers[i];

                await User.findOne({
                    where: {
                        userId: timer.userId
                    }
                }).then(async user => {
                    await User.findOne({
                        where: {
                            userId: timer.moderatorId
                        }
                    }).then(async moderator => {
                        let timeLeft;
                        await timediff(now, timer.expiration).then(left => timeLeft = left);

                        embed.addField(
                            `${timer.type}: ${user.userTag}`,
                            `**Reason**: ${timer.reason}\n` +
                            `**Moderator**: ${moderator.userTag}\n` +
                            `**Time left**: ${timeLeft}`,
                            false
                        );
                    });
                });
            }

            await Server.findOne({
                where: {
                    serverId: message.guild.id
                }
            }).then(server => {
                description = `All warnings for server **${server.serverName}**.`;
                embed.setColor(bot.embedColors.normal)
                    .setDescription(description)
                    .setTimestamp();
            });

            messageEditor(bot, message, embed, timers, description, now);
        }).catch(async err => {
            logger.error(err);
            embed.setColor(bot.embedColors.error)
                .setDescription(`Please contact the bot developer to resolve the error that occured!\n` +
                    `error: **${err}**`)
                .setTimestamp();

            await message.channel.send(embed);
        });
    }
}

function messageEditor(bot, message, embed, timers, description, now) {
    message.channel.send(embed)
        .then(async messageBot => {
            await tools.addPageArrows(messageBot);
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
                    .setColor(bot.embedColors.normal)
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
                messageBot.reactions.removeAll();
            });
        });
}

async function pageEmbed(message, page, timers, editEmbed, now) {
    for (let i = 5 * page; (i < 5 + (5 * page)) && (i < timers.length); i++) {
        const timer = timers[i];

        await User.findOne({
            where: {
                userId: timer.userId
            }
        }).then(async user => {
            await User.findOne({
                where: {
                    userId: timer.moderatorId
                }
            }).then(async moderator => {
                let timeLeft;
                await timediff(now, timer.expiration).then(left => timeLeft = left);

                embed.addField(
                    `${timer.type}: ${user.userTag}`,
                    `**Reason**: ${timer.reason}\n` +
                    `**Moderator**: ${moderator.userTag}\n` +
                    `**Time left**: ${timeLeft}`,
                    false
                );
            });
        });
    }

    editEmbed.setFooter(`Page ${page + 1}`);
}

async function timediff(now, expiration) {
    return pm(parseInt(expiration) - now.getTime(), {
        verbose: true
    });
}