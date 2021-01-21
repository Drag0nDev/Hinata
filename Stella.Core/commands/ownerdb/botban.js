const config = require("../../../config.json");
const {MessageEmbed} = require('discord.js');
const tools = require("../../misc/tools");
const {User} = require("../../misc/dbObjects");

module.exports = {
    name: 'botban',
    aliases: ['bb'],
    category: 'ownerdb',
    description: 'Dragon bonks aakash',
    usage: '[command | alias]',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        const id = new RegExp('[0-9]{17,}');
        let member;

        if (message.author.id !== config.owner)
            return tools.ownerOnly(bot, message.channel);

        if (!id.exec(args[0])) {
            embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid memberid / mention');

            return message.channel.send(embed);
        }

        await tools.getUser(bot, message, args).then(memberPromise => {
            member = memberPromise;
        });

        await User.findOne({
            where:
                {
                    userId: id.exec(args[0])[0]
                }
        }).then(user => {
            if (user.isBanned === 0) {
                user.isBanned = 1;
                user.level = 0;
                user.xp = 0;
                user.balance = 0;

                embed.setTitle('Bot ban')
                    .setDescription(`User **${user.userTag}** with id: **${user.userId}** is now banned from the bots level and currency system!\n` +
                    `Users balance and xp have been reset to 0`)
                    .setTimestamp();
            } else if (user.isBanned === 1) {
                user.isBanned = 0;
                embed.setTitle('Bot ban')
                    .setDescription(`User **${user.userTag}** with id: **${user.userId}** is now unbanned from the bots level and currency system!`)
                    .setTimestamp();
            }

            user.save();


        }).catch(err => {
            embed.setColor(bot.embedColors.error)
                .setDescription(`No user with id **${args[0]}** found in the database`)
                .setTimestamp();
        });

        await message.channel.send(embed);
    }
}