const {MessageEmbed} = require('discord.js');
const {User} = require('../../misc/dbObjects');
const {Servers} = require('../../misc/tools');

module.exports = {
    name: 'balance',
    aliases: ['bal', '$'],
    category: 'currency',
    description: 'Show your balance',
    usage: '[command | alias]',
    examples: ['s!$', 's!$ 418037700751261708', 's!$ @Drag0n#6666'],
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let member;
        let dbUser;

        await Servers.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        if (!member)
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid user ID or mention!'));

        dbUser = await User.findOne({
            where: {
                userId: member.user.id
            }
        });

        if (member.user.id !== message.author.id)
            embed.setDescription(`**${member.user.username}#${member.user.discriminator}** has **${dbUser.balance} ${bot.currencyEmoji}**`);
        else
            embed.setDescription(`You have **${dbUser.balance} ${bot.currencyEmoji}**`);

        await message.channel.send(embed);
    }
}