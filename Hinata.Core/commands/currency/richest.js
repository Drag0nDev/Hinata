const {Op} = require('sequelize')
const {MessageEmbed} = require('discord.js');
const {User, ServerUser} = require('../../misc/dbObjects');
const {Minor} = require('../../misc/tools');

module.exports = {
    name: 'richest',
    category: 'currency',
    description: 'Show the balance leaderboard of the server or the overall leaderboard on the bot.\n' +
        'To see the global leaderboard use ``global`` and for the server leaderboard use ``server``',
    usage: '[command | alias] <page>',
    examples: ['h!richest server', 'h!global 1'],
    cooldown: 30,
    run: async (bot, message, args) => {
        const lb = {
            send: async function (msg) {
                return message.channel.send(msg);
            },
            embed: new MessageEmbed()
                .setColor(bot.embedColors.normal),
            variation: args[0],
        }

        if (isNaN(parseInt(args[1])) || !args[1])
            lb.page = 0;
        else
            lb.page = parseInt(args[1]) - 1;

        if (!lb.variation){
            lb.embed.setDescription('Please provide a valid leaderboard.\n' +
                '- ``server``\n' +
                '- ``global``')
                .setTitle('Richest');
            return  lb.send(lb.embed);
        }

        switch (lb.variation.toLowerCase()) {
            case 'server':
                lb.embed.setTitle(`Richest ${lb.variation}`);
                await serverLb(bot, message, lb);
                break;
            case 'global':
                lb.embed.setTitle(`Richest ${lb.variation}`);
                await globalLb(bot, message, lb);
                break;
            default:
                lb.embed.setDescription('Please provide a valid leaderboard.\n' +
                    '- ``server``\n' +
                    '- ``global``')
                    .setTitle('Richest');
                await lb.send(lb.embed);
                break;
        }
    }
}

async function serverLb(bot, message, lb) {
    lb.dbUsers = await ServerUser.findAll({
        where: {
            guildId: message.guild.id
        },
        include: [
            {
                model: User,
                required: true,
                where: {
                    balance: {
                        [Op.gt]: 0
                    }
                }
            }
        ],
    });

    lb.dbUsers.sort((a, b) => b.user.balance - a.user.balance);

    lb.totalPages = Math.ceil(lb.dbUsers.length / 10);

    if (lb.page > lb.totalPages) {
        lb.embed.setColor(bot.embedColors.error)
            .setDescription(`There are only **${lb.totalPages}** pages in total.\n` +
                'Please pick another page!');
        return message.channel.send(lb.embed);
    }

    lb.embed.setColor(bot.embedColors.normal)
        .setFooter(`Page ${lb.page + 1}/${lb.totalPages}`);

    for (let i = 10 * lb.page; (i < 10 + (10 * lb.page)) && i < lb.dbUsers.length; i++) {
        lb.embed.addField(`${i + 1}. ${lb.dbUsers[i].user.userTag}`, `${lb.dbUsers[i].user.balance} ${bot.currencyEmoji}`, true);
    }

    messageEditor(bot, message, lb);
}

async function globalLb(bot, message, lb) {
    lb.dbUsers = await User.findAll({
        where: {
            balance: {
                [Op.gt]: 0
            }
        },
        order: [
            ['balance', 'DESC'],
        ]
    });

    lb.totalPages = Math.ceil(lb.dbUsers.length / 10);

    if (lb.page > lb.totalPages) {
        lb.embed.setColor(bot.embedColors.error)
            .setDescription(`There are only **${lb.totalPages}** pages in total.\n` +
                'Please pick another page!');
        return message.channel.send(embed);
    }

    lb.embed.setColor(bot.embedColors.normal)
        .setFooter(`Page ${lb.page + 1}/${lb.totalPages}`);

    for (let i = 10 * lb.page; (i < 10 + (10 * lb.page)) && i < lb.dbUsers.length; i++) {
        lb.embed.addField(`${i + 1}. ${lb.dbUsers[i].userTag}`, `${lb.dbUsers[i].balance} ${bot.currencyEmoji}`, true);
    }

    messageEditor(bot, message, lb);
}

function messageEditor(bot, message, lb) {
    message.channel.send(lb.embed)
        .then(async messageBot => {
            await Minor.addPageArrows(messageBot);

            const filter = (reaction, user) => {
                return (reaction.emoji.name === '◀' || reaction.emoji.name === '▶') && user.id === message.author.id;
            };

            const collector = messageBot.createReactionCollector(filter, {time: 60000});

            collector.on('collect', async (reaction, user) => {
                lb.editEmbed = new MessageEmbed()
                    .setTitle(`${lb.variation} leaderboard`)
                    .setColor(bot.embedColors.normal);

                if (reaction.emoji.name === '▶') {
                    lb.page++;
                    await pageEmbed(bot, message, lb);
                    lb.editEmbed.setFooter(`Page ${lb.page + 1}/${lb.totalPages}`);
                } else if (reaction.emoji.name === '◀') {
                    lb.page--;
                    if (lb.page < 0)
                        return;
                    await pageEmbed(bot, message, lb);
                    lb.editEmbed.setFooter(`Page ${lb.page + 1}/${lb.totalPages}`);
                }

                if (lb.editEmbed.fields.length !== 0) {
                    await messageBot.edit(lb.editEmbed);
                }
            });

            collector.on('end', () => {
                messageBot.reactions.removeAll().catch();
            });
        });
}

async function pageEmbed(bot, message, lb) {
    switch (lb.variation) {
        case 'server':
            for (let i = 10 * lb.page; (i < 10 + (10 * lb.page)) && (i < lb.dbUsers.length); i++) {
                lb.editEmbed.addField(`${i + 1}. ${lb.dbUsers[i].user.userTag}`, `${lb.dbUsers[i].user.balance} ${bot.currencyEmoji}`, true);
            }
            break;
        case 'global':
            for (let i = 10 * lb.page; (i < 10 + (10 * lb.page)) && (i < lb.dbUsers.length); i++) {
                lb.editEmbed.addField(`${i + 1}. ${lb.dbUsers[i].userTag}`, `${lb.dbUsers[i].balance} ${bot.currencyEmoji}`, true);
            }
            break;
    }
}

async function getUserTag(message, id) {
    let member = message.guild.members.cache.get(id);

    if (!member) {
        return await User.findOne({
            where: {
                userId: id
            }
        }).then(user => {
            return user.userTag;
        })
    } else {
        return member.user.tag;
    }
}