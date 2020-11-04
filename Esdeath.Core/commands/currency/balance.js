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
    run: async (bot, message) => {
        User.findOne({
            where: {
                userId: message.author.id
            }
        }).then(user => {
            let embed = new MessageEmbed();

            embed.setColor(bot.embedColors.normal)
                .setDescription(`You have **${user.balance} ${bot.currencyEmoji}**`);
            message.channel.send(embed);
        });
    }
}