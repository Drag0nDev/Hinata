const {MessageEmbed} = require('discord.js');
const {User} = require('../../misc/dbObjects');
const {Servers} = require('../../misc/tools');

module.exports = {
    name: 'balance',
    aliases: ['bal', '$'],
    category: 'currency',
    description: 'Show your balance',
    usage: '[command | alias]',
    examples: ['h!$', 'h!$ 418037700751261708', 'h!$ @Drag0n#6666'],
    cooldown: 10,
    run: async (bot, message, args) => {
        let balance = {
            send: async (msg) => {
                return message.channel.send(msg);
            },
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal),
        };

        balance.member = await Servers.getMember(message, args);

        if (!balance.member)
            return balance.send(embed.setColor(bot.embedColors.embeds.error)
                .setDescription('Please provide a valid user ID or mention!'));

        balance.dbUser = await User.findOne({
            where: {
                userId: balance.member.user.id
            }
        });

        if (balance.member.user.id !== message.author.id)
            balance.embed.setDescription(`**${balance.member.user.username}#${balance.member.user.discriminator}** has **${balance.dbUser.balance} ${bot.currencyEmoji}**`);
        else
            balance.embed.setDescription(`You have **${balance.dbUser.balance} ${bot.currencyEmoji}**`);

        await balance.send(balance.embed);
    }
}