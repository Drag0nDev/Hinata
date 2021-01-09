const {Op} = require('sequelize')
const {MessageEmbed} = require('discord.js');
const {User, ServerUser} = require('../../misc/dbObjects');
const config = require("../../../config.json");
const tools = require('../../misc/tools');
const logger = require("log4js").getLogger();

module.exports = {
    name: 'leaderboard',
    aliases: ['lb', 'glb', 'globalleaderboard'],
    category: 'xp',
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

        console.log(message.content)

        if (message.content.includes('glb') || message.content.includes('globalleaderboard')) {
            globalLb(bot, message);
        } else {
            serverLb(bot, message);
        }
    }
}

function serverLb(bot, message) {
    const embed = new MessageEmbed()
        .setTitle('Server leaderboard')
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
    }).then(users => {
        for (let i = 0; i < 10 && i < users.length; i++) {
            let member = message.guild.members.cache.get(users[i].userId);
            let xp = users[i].xp;
            let lvlXp = config.levelXp;
            let level = 0;
            let nextLvlXp = 0;

            do {
                nextLvlXp = lvlXp + ((lvlXp / 2) * level);

                if (xp >= nextLvlXp) {
                    level++;
                    xp -= nextLvlXp;
                }
            } while (xp > nextLvlXp);

            embed.addField(`${i + 1}. ${member.user.tag}`, `Level ${level}\n(${users[i].xp}xp)`, true);
        }

        messageEditor(bot, message, embed, users);
    });
}

function globalLb(bot, message) {
    const embed = new MessageEmbed()
        .setTitle('Server leaderboard')
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

            for (; level > 0; level--){
                previousLvlXp = lvlXp + ((lvlXp / 2) * (level - 1));
                xp += previousLvlXp;
            }

            embed.addField(`${i + 1}. ${users[i].userTag}`, `Level ${users[i].level}\n(${xp}xp)`, true);
        }

        messageEditor(bot, message, embed, users);
    });
}

function messageEditor(bot, message, embed, users) {
    message.channel.send(embed)
        .then(async messageBot => {
            await messageBot.react('◀');
            await messageBot.react('▶');
            let page = 0;

            const filter = (reaction, user) => {
                return (reaction.emoji.name === '◀' || reaction.emoji.name === '▶') && user.id === message.author.id;
            };

            const collector = messageBot.createReactionCollector(filter, {time: 60000});

            collector.on('collect', async (reaction, user) => {
                let editEmbed = new MessageEmbed()
                    .setTitle('Server leaderboard')
                    .setColor(bot.embedColors.normal);

                if (reaction.emoji.name === '▶') {
                    page++;
                    await pageSwitch(message, page, users, editEmbed);
                } else if (reaction.emoji.name === '◀') {
                    page--;
                    if (page < 0)
                        return;
                    await pageSwitch(message, page, users, editEmbed);
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

async function pageSwitch(message, page, users, editEmbed) {
    for (let i = 10 * page; (i < 10 + (10 * page)) && (i < Object.keys(users).length); i++) {
        let member = message.guild.members.cache.get(users[i].userId);
        let xp = users[i].xp;
        let lvlXp = config.levelXp;
        let level = 0;
        let nextLvlXp = 0;
        let membertag;

        do {
            nextLvlXp = lvlXp + ((lvlXp / 2) * level);

            if (xp >= nextLvlXp) {
                level++;
                xp -= nextLvlXp;
            }
        } while (xp > nextLvlXp);

        if (!member) {
            await User.findOne({
                where: {
                    userId: users[i].userId
                }
            }).then(user => {
                membertag = user.userTag;
                console.log(user.userTag)
            })
        } else {
            membertag = member.user.tag;
        }

        editEmbed.addField(`${i + 1}. ${membertag}`, `Level ${level}\n (${users[i].xp}xp)`, true);
    }

    editEmbed.setFooter(`Page ${page + 1}`);
}
