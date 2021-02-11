const {MessageEmbed} = require('discord.js');
const {User} = require('../../misc/dbObjects');
const config = require("../../../config.json");
const {Permissions, Servers} = require('../../misc/tools');

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
        let user;

        if (message.author.id !== config.owner) {
            Permissions.ownerOnly(bot, message.channel)
            return;
        }

        if (!id.exec(args[0])) {
            embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid memberid / mention');

            return message.channel.send(embed);
        }

        let member;

        await Servers.getUser(bot, message, args).then(memberPromise => {
            member = memberPromise;
        });

        if (bal.exec(args[1])[0] === '')
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide an amount to add!'))

        user = await User.findOne({
            where:
                {
                    userId: id.exec(args[0])[0]
                }
        })
        .catch(err => {
            embed.setColor(bot.embedColors.error)
                .setDescription(`No user with id **${args[0]}** found in the database`)
                .setTimestamp();
        });

        User.add(user, parseInt(args[1]));

        embed.setTitle(`Add balance`)
            .setColor(bot.embedColors.normal)
            .setDescription(`Balance successfully added!\n` +
                `The balance of **${user.userTag}** is now **${user.balance}${bot.currencyEmoji}**.`)
            .setTimestamp();

        await message.channel.send(embed);
    }
}