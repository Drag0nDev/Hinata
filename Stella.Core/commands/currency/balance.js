const {MessageEmbed} = require('discord.js');
const { User } = require('../../misc/dbObjects');
const tools = require('../../misc/tools');

module.exports = {
    name: 'balance',
    aliases: ['bal', '$'],
    category: 'currency',
    description: 'Show your balance',
    usage: '[command | alias]',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let member;

        await tools.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        if (!member)
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid user ID or mention!'));

        User.findOne({
            where: {
                userId: member.user.id
            }
        }).then(user => {


            if (member.user.id !== message.author.id)
                embed.setDescription(`**${member.user.username}#${member.user.discriminator}** has **${user.balance} ${bot.currencyEmoji}**`);
            else
                embed.setDescription(`You have **${user.balance} ${bot.currencyEmoji}**`);

            message.channel.send(embed);
        });
    }
}