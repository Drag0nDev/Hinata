const {MessageEmbed} = require('discord.js');
const {User} = require('../../misc/dbObjects');
const config = require("../../../config.json");
const tools = require('../../misc/tools');

module.exports = {
    name: 'setstreak',
    aliases: ['ss', 'streak'],
    category: 'ownerdb',
    description: 'Add a streak to a specified user',
    usage: '[command | alias] <id/mention>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed();
        const id = new RegExp('[0-9]{17,}');
        const streak = new RegExp('[0-9]*');

        if (message.author.id !== config.owner) {
            tools.ownerOnly(bot, message.channel)
            return;
        }

        if (!id.exec(args[0])) {
            embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid memberid / mention');

            return message.channel.send(embed);
        }

        let member;

        await tools.getUser(bot, message, args).then(memberPromise => {
            member = memberPromise;
        });

        if (streak.exec(args[1])[0] === '')
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide an amount to add!'))

        await User.findOne({
            where:
                {
                    userId: id.exec(args[0])[0]
                }
        }).then(user => {
            user.dailyStreak += parseInt(args[1]);
            user.save();

            embed.setTitle(`Add dailystreak`)
                .setColor(bot.embedColors.normal)
                .setDescription(`Dailystreak successfully increased!
                The streak of **${user.userTag}** is now **${user.dailyStreak} days**.`)
                .setTimestamp();
        }).catch(err => {
            embed.setColor(bot.embedColors.error)
                .setDescription(`No user with id **${args[0]}** found in the database`)
                .setTimestamp();
        });

        await message.channel.send(embed);
    }
}