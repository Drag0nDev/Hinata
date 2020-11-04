const {MessageEmbed} = require('discord.js');
const {User} = require('../../../dbObjects');
const Sequelize = require('sequelize');
const pm = require('parse-ms');
const config = require("../../../config.json");

module.exports = {
    name: 'finduser',
    aliases: ['fu', 'getuser'],
    category: 'owner',
    description: 'Reset a users global xp',
    usage: '[command | alias] <id>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal)
            .setDescription(`Getting the info of user with id **${args[0]}**`);

        const userB = bot.users.cache.get(args[0]);

        if (message.author.id !== config.owner)
            return;

        const $message = await message.channel.send(embed);

        let edit = new MessageEmbed().setColor(bot.embedColors.normal);

        if (message.author.id !== config.owner)
            return;

        if (userB) {
            edit.addField(`Name`, `${userB.username}#${userB.discriminator}`, true)
                .addField(`Id`, userB.id, true)
                .addField('\u200B', '\u200B', true)
                .setImage(userB.avatarURL({
                    dynamic: true,
                    size: 4096
                }));
        } else {
            edit.setDescription(`I could not find the user with id: **${args[0]}** in my cache.`);
        }

        User.findOne({
            where: {
                userId: args[0]
            }
        }).then(user => {
            edit.addField('Currency', `${user.balance} ${bot.currencyEmoji}`, true)
                .addField('Global level', user.level, true)
                .addField('Global xp', user.xp, true);

            $message.edit(edit);
        });
    }
}