const {MessageEmbed} = require('discord.js');
const {User} = require('../../misc/dbObjects');
const config = require("../../../config.json");
const tools = require("../../misc/tools");

module.exports = {
    name: 'addbalance',
    aliases: ['addbal', 'ab'],
    category: 'ownerdb',
    description: 'Add balance to a specified user',
    usage: '[command | alias] <id/mention>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed();
        const id = new RegExp('[0-9]{17,}');
        const bal = new RegExp('^[0-9]*');

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

        if (bal.exec(args[1])[0] === '')
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide an amount to add!'))

        await User.findOne({
            where:
                {
                    userId: id.exec(args[0])[0]
                }
        }).then(user => {
            user.balance += parseInt(args[1]);
            user.save();

            embed.setTitle(`Add balance`)
                .setColor(bot.embedColors.normal)
                .setDescription(`Balance successfully added!\n` +
                    `The balance of **${user.userTag}** is now **${user.balance}${bot.currencyEmoji}**.`)
                .setTimestamp();
        }).catch(err => {
            embed.setColor(bot.embedColors.error)
                .setDescription(`No user with id **${args[0]}** found in the database`)
                .setTimestamp();
        });

        await message.channel.send(embed);
    }
}