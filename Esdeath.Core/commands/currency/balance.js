const {MessageEmbed} = require('discord.js');
const { User } = require('../../../dbObjects');
const Sequelize = require('sequelize');
const pm = require('parse-ms');

module.exports = {
    name: 'balance',
    aliases: ['bal', '$'],
    category: 'currency',
    description: 'Show your balance',
    usage: '[command | alias]',
    run: async (bot, message, args) => {
        let member = !args[0] ? message.guild.members.cache.get(message.author.id) : message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        User.findOne({
            where: {
                userId: member.user.id
            }
        }).then(user => {
            let embed = new MessageEmbed().setColor(bot.embedColors.normal);

            if (member.user.id !== message.author.id)
                embed.setDescription(`**${member.user.username}#${member.user.discriminator}** has **${user.balance} ${bot.currencyEmoji}**`);
            else
                embed.setDescription(`You have **${user.balance} ${bot.currencyEmoji}**`);

            message.channel.send(embed);
        });
    }
}