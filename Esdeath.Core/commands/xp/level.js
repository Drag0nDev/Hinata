const {MessageEmbed} = require('discord.js');
const { User, ServerUser } = require('../../../dbObjects');
const config = require("../../../config.json");
const Sequelize = require('sequelize');
const pm = require('parse-ms');

module.exports = {
    name: 'level',
    aliases: ['lvl'],
    category: 'xp',
    description: 'Show your level',
    usage: '[command | alias]',
    run: async (bot, message, args) => {
        const levelXp = config.levelXp;

        let member = !args[0] ? message.guild.members.cache.get(message.author.id) : message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        User.findOne({
            where: {
                userId: member.user.id
            }
        }).then(user => {
            let embed = new MessageEmbed().setColor(bot.embedColors.normal)
                .setThumbnail(member.user.avatarURL({dynamic: true}))
                .setFooter('This embed is but a placeholder. There will be a picture format level card later');

            embed.setTitle(`${member.user.username}#${member.user.discriminator}`)
                .addField(`Global level`, user.level, true)
                .addField(`Global xp`, `${user.xp}/${levelXp + ((levelXp / 2) * user.level)}`, true)
                .addField('\u200B', '\u200B', false);

            ServerUser.findOne({
                where: {
                    userId: message.author.id,
                    guildId: message.guild.id
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
                    .addField('Server xp', `${xp}/${levelXp + ((levelXp / 2) * level)}`, true);

                message.channel.send(embed);
            });
        });
    }
}