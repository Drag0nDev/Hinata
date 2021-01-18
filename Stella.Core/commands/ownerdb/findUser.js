const {MessageEmbed} = require('discord.js');
const {User} = require('../../misc/dbObjects');
const Sequelize = require('sequelize');
const pm = require('parse-ms');
const config = require("../../../config.json");
const tools = require("../../misc/tools");

module.exports = {
    name: 'finduser',
    aliases: ['fu', 'getuser'],
    category: 'ownerdb',
    description: 'Find info about a user',
    usage: '[command | alias] <id/mention>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed()

        if (message.author.id !== config.owner) {
            tools.ownerOnly(bot, message.channel)
            return;
        }

        if (!args[0]) {
            embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid memberid / mention');

            return message.channel.send(embed);
        }

        embed.setColor(bot.embedColors.normal)
            .setDescription(`Getting the info of user with id **${args[0]}**`);

        let member = message.mentions.members.first();

        const userB = bot.users.cache.get(args[0]) || bot.users.cache.get(member.user.id);

        await message.channel.send(embed).then(message => {
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
                    userId: userB.id
                }
            }).then(user => {
                edit.addField('Currency', `${user.balance} ${bot.currencyEmoji}`, true)
                    .addField('Global level', user.level, true)
                    .addField('Global xp', user.xp, true);

                message.edit(edit);
            });
        });
    }
}