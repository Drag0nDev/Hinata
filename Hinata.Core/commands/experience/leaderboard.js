const {Op} = require('sequelize')
const {MessageEmbed} = require('discord.js');
const {User, ServerUser} = require('../../misc/dbObjects');
const config = require("../../../config.json");
const {Permissions, Levels, Minor} = require('../../misc/tools');
const neededPerm = ['ADD_REACTIONS'];

module.exports = {
    name: 'leaderboard',
    aliases: ['lb', 'glb', 'globalleaderboard'],
    category: 'experience',
    description: 'Show the level leaderboard of the server or the overall leaderboard on the bot.\n' +
        'To see the global leaderboard use ``glb`` or ``globalleaderboard``.\n' +
        'You can also jump to a certain page by providing the page number.',
    usage: '[command | alias] <page>',
    examples: ['h!lb', 'h!glb'],
    neededPermissions: neededPerm,
    cooldown: 10,
    run: async (bot, message, args) => {
        const lb = {
            embed: new MessageEmbed()
        }

        if (isNaN(parseInt(args[0])) || !args[0])
            lb.page = 0;
        else
            lb.page = parseInt(args[0]) - 1;

        if (message.content.includes('glb') || message.content.includes('globalleaderboard')) {
            lb.variation = 'Global';
            await globalLb(bot, message, lb);
        } else {
            lb.variation = 'Server';
            await serverLb(bot, message, lb);
        }
    }
}

async function serverLb(bot, message, lb) {
    lb.dbUsers = await ServerUser.findAll({
        where: {
            guildId: message.guild.id,
            xp: {
                [Op.gt]: 0
            }
        },
        order: [
            ['xp', 'DESC']
        ]
    });

    lb.totalPages = Math.ceil(lb.dbUsers.length / 10);
    lb.embed.setTitle(`${lb.variation} leaderboard`);


    if (lb.page > lb.totalPages) {
        lb.embed.setColor(bot.embedColors.embeds.error)
            .setDescription(`There are only **${lb.totalPages}** pages in total.\n` +
                'Please pick another page!');
        return message.channel.send(lb.embed);
    }

    lb.embed.setColor(bot.embedColors.embeds.normal)
        .setFooter(`Page ${lb.page + 1}/${lb.totalPages}`);

    for (let i = 10 * lb.page; (i < 10 + (10 * lb.page)) && i < lb.dbUsers.length; i++) {
        let memberTag = await getUserTag(message, lb.dbUsers[i].userId);
        let level = Levels.getLevel(lb.dbUsers[i].xp);

        lb.embed.addField(`${i + 1}. ${memberTag}`, `Level ${level}\n(${lb.dbUsers[i].xp}xp)`, true);
    }

    messageEditor(bot, message, lb);
}

async function globalLb(bot, message, lb) {
    lb.dbUsers = await User.findAll({
        where: {
            xp: {
                [Op.gt]: 0
            }
        },
        order: [
            ['level', 'DESC'],
            ['xp', 'DESC']
        ]
    });

    lb.totalPages = Math.ceil(lb.dbUsers.length / 10);

    lb.embed = new MessageEmbed()
        .setTitle(`${lb.variation} leaderboard`);


    if (lb.page > lb.totalPages) {
        lb.embed.setColor(bot.embedColors.embeds.error)
            .setDescription(`There are only **${lb.totalPages}** pages in total.\n` +
                'Please pick another page!');
        return message.channel.send(lb.embed);
    }

    lb.embed.setColor(bot.embedColors.embeds.normal)
        .setFooter(`Page ${lb.page + 1}/${lb.totalPages}`);

    for (let i = 10 * lb.page; (i < 10 + (10 * lb.page)) && i < lb.dbUsers.length; i++) {
        let xp = lb.dbUsers[i].xp;
        let lvlXp = config.levelXp;
        let level = lb.dbUsers[i].level;
        let previousLvlXp = 0;

        for (; level > 0; level--) {
            previousLvlXp = lvlXp + ((lvlXp / 2) * (level - 1));
            xp += previousLvlXp;
        }

        lb.embed.addField(`${i + 1}. ${lb.dbUsers[i].userTag}`, `Level ${lb.dbUsers[i].level}\n(${xp}xp)`, true);
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
                    .setColor(bot.embedColors.embeds.normal);

                if (reaction.emoji.name === '▶') {
                    lb.page++;
                    await pageEmbed(message, lb);
                    lb.editEmbed.setFooter(`Page ${lb.page + 1}/${lb.totalPages}`);
                } else if (reaction.emoji.name === '◀') {
                    lb.page--;
                    if (lb.page < 0)
                        return;
                    await pageEmbed(message, lb);
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

async function pageEmbed(message, lb) {
    switch (lb.variation) {
        case "Global":
            for (let i = 10 * lb.page; (i < 10 + (10 * lb.page)) && i < lb.dbUsers.length; i++) {
                let xp = lb.dbUsers[i].xp;
                let lvlXp = config.levelXp;
                let level = lb.dbUsers[i].level;
                let previousLvlXp = 0;

                for (; level > 0; level--) {
                    previousLvlXp = lvlXp + ((lvlXp / 2) * (level - 1));
                    xp += previousLvlXp;
                }

                lb.editEmbed.addField(`${i + 1}. ${lb.dbUsers[i].userTag}`, `Level ${lb.dbUsers[i].level}\n(${xp}xp)`, true);
            }
            break;
        case "Server":
            for (let i = 10 * lb.page; (i < 10 + (10 * lb.page)) && (i < lb.dbUsers.length); i++) {
                let memberTag = await getUserTag(message, lb.dbUsers[i].userId);
                let level = Levels.getLevel(lb.dbUsers[i].xp);

                lb.editEmbed.addField(`${i + 1}. ${memberTag}`, `Level ${level}\n (${lb.dbUsers[i].xp}xp)`, true);
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