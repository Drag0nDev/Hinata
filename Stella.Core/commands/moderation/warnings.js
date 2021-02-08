const neededPerm = ['KICK_MEMBERS'];
const {MessageEmbed} = require("discord.js");
const {Warnings, User, Server} = require('../../misc/dbObjects');
const {Permissions, Minor, Compare, Servers, Dates, Roles, Levels, Logs} = require('../../misc/tools');
const logger = require("log4js").getLogger();

module.exports = {
    name: 'warnings',
    aliases: ['warns'],
    category: 'moderation',
    description: 'This command shows the warnings depending on the input.\n' +
        'possible inputs and their usage:\n' +
        '- `stella warns all` shows all the warns logged for the server.\n' +
        '- `stella warns [member mention/id]` shows all the warns of a user.',
    usage: '[command | alias] [Member mention/id]',
    examples: ['s!warns @Drag0n#6666', 's!warns 418037700751261708', 's!warns all'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setFooter('Page 1');
        const choice = new RegExp('all|[0-9]{17,}');
        const id = new RegExp('[0-9]{17,}');

        //check member and bot permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = Permissions.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        if (!args[0] || choice.exec(args[0])[0] === 'all') {
            await showAll(bot, message, embed, 'All');
        } else if (parseInt(choice.exec(args[0])[0])) {
            let memberId;

            await Servers.getMember(message, args).then(memberPromise => {
                memberId = memberPromise.user.id;
            }).catch(err => {
                memberId = id.exec(args[0])[0];
            });

            await showUser(bot, message, memberId, embed, 'User');
        }
    }
}

async function showAll(bot, message, embed, variation) {
    embed.setTitle(`${variation} warnings`)
        .setThumbnail(message.guild.iconURL({
            dynamic: true,
            size: 4096
        }));
    let description;
    let warnings;
    let server;

    warnings = await Warnings.findAll({
            where: {
                guildId: message.guild.id
            },
            order: [
                ['casenr', 'DESC'],
            ]
        }
    ).catch(async err => {
        logger.error(err);
        embed.setColor(bot.embedColors.error)
            .setDescription(`Please contact the bot developer to resolve the error that occured!\n` +
                `error: **${err}**`)
            .setTimestamp();

        await message.channel.send(embed);
    });

    if (!warnings[0])
        return message.channel.send(embed.setDescription('No warns in this server!')
            .setColor(bot.embedColors.normal)
            .setTimestamp());

    for (let i = 0; i < 5 && i < warnings.length; i++) {
        const warning = warnings[i];

        await User.findOne({
            where: {
                userId: warning.userId
            }
        }).then(async user => {
            await User.findOne({
                where: {
                    userId: warning.moderatorId
                }
            }).then(moderator => {
                embed.addField(
                    `case ${warning.casenr}. ${user.userTag}`,
                    `**Reason**: ${warning.reason}\n` +
                    `**Moderator**: ${moderator.userTag}`,
                    false
                );
            });
        });

        server = await Server.findOne({
            where: {
                serverId: message.guild.id
            }
        });

        description = `All warnings for server **${server.serverName}**.`;
        embed.setColor(bot.embedColors.normal)
            .setDescription(description)
            .setTimestamp();

        messageEditor(bot, message, embed, warnings, variation, description);
    }
}

async function showUser(bot, message, memberId, embed, variation) {
    embed.setTitle(`${variation} warnings`)
        .setThumbnail(message.guild.iconURL({
            dynamic: true,
            size: 4096
        }));
    let description;
    let warnings;
    let server;

    warnings = await Warnings.findAll({
            where: {
                guildId: message.guild.id,
                userId: memberId
            },
            order: [
                ['casenr', 'DESC'],
            ]
        }
    ).catch(async err => {
        logger.error(err);
        embed.setColor(bot.embedColors.error)
            .setDescription(`Please contact the bot developer to resolve the error that occured!\n` +
                `error: **${err}**`)
            .setTimestamp();

        await message.channel.send(embed);
    });

    if (!warnings[0])
        return message.channel.send(embed.setDescription('No warns for this user!')
            .setColor(bot.embedColors.normal)
            .setTimestamp());

    for (let i = 0; i < 5 && i < warnings.length; i++) {
        const warning = warnings[i];
        let user;
        let moderator;

        user = await User.findOne({
            where: {
                userId: warning.userId
            }
        });

        moderator = await User.findOne({
            where: {
                userId: warning.moderatorId
            }
        });

        embed.addField(
            `case ${warning.casenr}. ${user.userTag}`,
            `**Reason**: ${warning.reason}\n` +
            `**Moderator**: ${moderator.userTag}`,
            false
        );
    }

    server = await Server.findOne({
        where: {
            serverId: message.guild.id
        }
    });

    description = `All warnings for server **${server.serverName}**.`;
    embed.setColor(bot.embedColors.normal)
        .setDescription(description)
        .setTimestamp();

    messageEditor(bot, message, embed, warnings, variation, description);
}

function messageEditor(bot, message, embed, warnings, variation, description) {
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
                    .setTitle(`${variation} warnings`)
                    .setThumbnail(message.guild.iconURL({
                        dynamic: true,
                        size: 4096
                    }))
                    .setDescription(description)
                    .setColor(bot.embedColors.normal)
                    .setTimestamp();

                if (reaction.emoji.name === '▶') {
                    page++;
                    await pageEmbed(message, page, warnings, editEmbed);
                } else if (reaction.emoji.name === '◀') {
                    page--;
                    if (page < 0)
                        return;
                    await pageEmbed(message, page, warnings, editEmbed);
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

async function pageEmbed(message, page, warnings, editEmbed) {
    for (let i = 5 * page; (i < 5 + (5 * page)) && (i < warnings.length); i++) {
        const warning = warnings[i];
        let user;
        let moderator;

        user = await User.findOne({
            where: {
                userId: warning.userId
            }
        });

        moderator = await User.findOne({
            where: {
                userId: warning.moderatorId
            }
        });

        editEmbed.addField(
            `case ${warning.casenr}. ${user.userTag}`,
            `**Reason**: ${warning.reason}\n` +
            `**Moderator**: ${moderator.userTag}`,
            false
        );
    }

    editEmbed.setFooter(`Page ${page + 1}`);
}
