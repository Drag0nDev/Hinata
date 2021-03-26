const {MessageEmbed} = require('discord.js');
const { User } = require('../../misc/dbObjects');
const config = require("../../../config.json");
const {Permissions, Servers} = require('../../misc/tools');

module.exports = {
    name: 'resetuser',
    aliases: ['ru'],
    category: 'ownerdb',
    description: 'Resets all global xp/balance/level/streak of a user',
    usage: '[command | alias] <id>',
    ownerOnly: true,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed();
        const id = new RegExp('[0-9]{17,}');

        if (!id.exec(args[0]))
            return message.channel.send(embed.setColor(bot.embedColors.embeds.error)
                .setDescription('Please provide a valid memberid / mention'));

        let member;

        await Servers.getUser(bot, message, args).then(memberPromise => {
            member = memberPromise;
        });

        await User.findOne({
            where: {
                userId: id.exec(args[0])[0]
            }
        }).then(user => {
            user.xp = 0;
            user.level = 0;
            user.dailyStreak = 0;
            user.balance = 0;
            user.save();

            embed.setColor(bot.embedColors.embeds.normal)
                .setDescription(`The user **${user.userTag}** has been reset successfully!`);
        }).catch(err => {
            embed.setColor(bot.embedColors.embeds.error)
                .setDescription(`No user with id **${args[0]}** found in the database`)
                .setTimestamp();
        });

        await message.channel.send(embed);
    }
}