const {MessageEmbed} = require('discord.js');
const {User} = require('../../misc/dbObjects');
const config = require("../../../config.json");

module.exports = {
    name: 'removebalance',
    aliases: ['rembal', 'rb'],
    category: 'ownerdb',
    description: 'Remove balance from a specified user',
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

        if (bal.exec(args[1])[0] === '')
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide an amount to remove!'))

        await User.findOne({
            where:
                {
                    userId: id.exec(args[0])[0]
                }
        }).then(user => {
            user.balance -= parseInt(args[1]);
            user.save();

            embed.setTitle(`Add balance`)
                .setColor(bot.embedColors.normal)
                .setDescription(`Balance successfully removed!
                The balance of **${user.userTag}** is now **${user.balance}${bot.currencyEmoji}**.`)
                .setTimestamp();
        }).catch(err => {
            embed.setColor(bot.embedColors.error)
                .setDescription(`No user with id **${args[0]}** found in the database`)
                .setTimestamp();
        });

        await message.channel.send(embed);
    }
}