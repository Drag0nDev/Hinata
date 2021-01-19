const {Op} = require('sequelize')
const {MessageEmbed} = require('discord.js');
const {User, ServerUser} = require('../../misc/dbObjects');
const config = require("../../../config.json");
const tools = require('../../misc/tools');
const logger = require("log4js").getLogger();

module.exports = {
    name: 'leaderboard',
    aliases: ['lb', 'glb', 'globalleaderboard'],
    category: 'experience',
    description: 'Show the level leaderboard of the server or the overall leaderboard on the bot.\n' +
        'To see the global leaderboard use ``glb`` or ``globalleaderboard``',
    usage: '[command | alias]',
    neededPermissions: ['ADD_REACTIONS'],
    run: async (bot, message) => {
        let neededPerm = 'ADD_REACTIONS';

        if (!message.guild.me.hasPermission(neededPerm))
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription(`I don't have the required permission to execute this command\n` +
                    `**Missing requirements:** ${neededPerm}`));

        if (message.content.includes('glb') || message.content.includes('globalleaderboard')) {
            globalLb(bot, message, 'Global');
        } else {
            await serverLb(bot, message, 'Server');
        }
    }
}

async function serverLb(bot, message, variation) {
    const embed = new MessageEmbed()
        .setTitle(`${variation} leaderboard`)
        .setColor(bot.embedColors.normal)
        .setFooter(`Page 1`);

    ServerUser.findAll({
        where: {
            guildId: message.guild.id,
            xp: {
                [Op.gt]: 0
            }
        },
        order: [
            ['xp', 'DESC']
        ]
    }).then(async users => {
        for (let i = 0; i < 10 && i < users.length; i++) {
            let memberTag = await getUserTag(message, users[i].userId);
            let level = getLevel(users[i].xp);

            embed.addField(`${i + 1}. ${memberTag}`, `Level ${level}\n(${users[i].xp}xp)`, true);
        }

        messageEditor(bot, message, embed, users, variation);
    });
}

function globalLb(bot, message,variation) {
    const embed = new MessageEmbed()
        .setTitle(`${variation} leaderboard`)
        .setColor(bot.embedColors.normal)
        .setFooter(`Page 1`);

    User.findAll({
        where: {
            xp: {
                [Op.gt]: 0
            }
        },
        order: [
            ['level', 'DESC'],
            ['xp', 'DESC']
        ]
    }).then(users => {
        for (let i = 0; i < 10; i++) {
            let xp = users[i].xp;
            let lvlXp = config.levelXp;
            let level = users[i].level;
            let previousLvlXp = 0;

            for (; level > 0; level--) {
                previousLvlXp = lvlXp + ((lvlXp / 2) * (level - 1));
                xp += previousLvlXp;
            }

            embed.addField(`${i + 1}. ${users[i].userTag}`, `Level ${users[i].level}\n(${xp}xp)`, true);
        }

        messageEditor(bot, message, embed, users, variation);
    });
}

function messageEditor(bot, message, embed, users, variation) {
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
                    .setTitle(`${variation} leaderboard`)
                    .setColor(bot.embedColors.normal);

                if (reaction.emoji.name === '▶') {
                    page++;
                    await pageEmbed(message, page, users, editEmbed);
                } else if (reaction.emoji.name === '◀') {
                    page--;
                    if (page < 0)
                        return;
                    await pageEmbed(message, page, users, editEmbed);
                }

                if (Object.keys(editEmbed.fields).length !== 0) {
                    await messageBot.edit(editEmbed);
                }
            });

            collector.on('end', collected => {
                messageBot.reactions.removeAll();
            });
        });
}

async function pageEmbed(message, page, users, editEmbed) {
    for (let i = 10 * page; (i < 10 + (10 * page)) && (i < Object.keys(users).length); i++) {
        let memberTag = await getUserTag(message, users[i].userId);
        let level = getLevel(users[i].xp);

        editEmbed.addField(`${i + 1}. ${memberTag}`, `Level ${level}\n (${users[i].xp}xp)`, true);
    }

    editEmbed.setFooter(`Page ${page + 1}`);
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

function getLevel(userXp) {
    let lvlXp = config.levelXp;
    let level = 0;
    let nextLvlXp = 0;

    do {
        nextLvlXp = lvlXp + ((lvlXp / 2) * level);

        if (userXp >= nextLvlXp) {
            level++;
            userXp -= nextLvlXp;
        }
    } while (userXp > nextLvlXp);

    return level;
}