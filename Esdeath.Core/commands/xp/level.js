const {MessageEmbed} = require('discord.js');
const { User } = require('../../../dbObjects');
const Sequelize = require('sequelize');
const pm = require('parse-ms');

module.exports = {
    name: 'level',
    aliases: ['xp'],
    category: 'xp',
    description: 'Show your level',
    usage: '[command | alias]',
    run: async (bot, message) => {
        const levelXp = 30;
        User.findOne({
            where: {
                userId: message.author.id
            }
        }).then(user => {
            let embed = new MessageEmbed();

            embed.setColor(bot.embedColors.normal)
                .setTitle(`${message.author.username}#${message.author.discriminator}`)
                .addField(`Level`, user.level)
                .addField(`Xp`, `${user.xp}/${levelXp + (levelXp * user.level)}`)
                .setFooter('This embed is but a placeholder. There will be a picture format level card later');
            message.channel.send(embed);
        });
    }
}