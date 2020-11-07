const {MessageEmbed} = require('discord.js');
const { User, ServerUser } = require('../../../dbObjects');
const config = require("../../../config.json");
const Sequelize = require('sequelize');
const pm = require('parse-ms');

module.exports = {
    name: 'level',
    aliases: ['lvl'],
    category: 'xp',
    description: 'Show the level card of yourself or a server member',
    usage: '[command | alias] <mention/ID>',
    run: async (bot, message, args) => {
        const levelXp = config.levelXp;
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);

        let member = !args[0] ? await message.guild.members.cache.get(message.author.id) : await message.mentions.members.first() || await message.guild.members.cache.get(args[0]);

        if (!member)
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid user ID or mention!'));

        User.findAll({
            order: [['level', 'DESC'], ['xp', 'DESC']]
        }).then(userList => {
            let userListId = [];

            userList.forEach(user => {
                userListId.push(user.userId);
            });

            ServerUser.findAll({
                order: [['xp', 'DESC']],
                where: {
                    guildId: message.guild.id
                }
            }).then(userServerList => {
                let userServerListId = [];

                userServerList.forEach(userServer => {
                    userServerListId.push(userServer.userId);
                });

                let globalRank = userServerListId.indexOf(member.user.id) + 1
                let serverRank = userListId.indexOf(member.user.id) + 1

                User.findOne({
                    where: {
                        userId: member.user.id
                    }
                }).then(user => {
                    embed.setTitle(`${member.user.username}#${member.user.discriminator}`)
                        .setThumbnail(member.user.avatarURL({dynamic: true}))
                        .addField(`Global level`, user.level, true)
                        .addField(`Global xp`, `${user.xp}/${levelXp + ((levelXp / 2) * user.level)}`, true)
                        .addField('Global rank', globalRank, true)
                        .setFooter('This embed is but a placeholder. There will be a picture format level card later');

                    ServerUser.findOne({
                        where: {
                            userId: member.user.id,
                            guildId: member.guild.id
                        }
                    }).then(serverUser => {
                        let xp = serverUser.xp;
                        let lvlXp = levelXp;
                        let level = 0;
                        let nextLvlXp = 0;

                        do {
                            nextLvlXp = lvlXp + ((lvlXp / 2) * level);

                            if (xp >= nextLvlXp) {
                                level++;
                                xp -= nextLvlXp;
                            }
                        } while (xp > nextLvlXp)
                        embed.addField('Server level', level, true)
                            .addField('Server xp', `${xp}/${levelXp + ((levelXp / 2) * level)}`, true)
                            .addField('Server rank', serverRank, true);

                        message.channel.send(embed);
                    });
                });
            });
        });
    }
}