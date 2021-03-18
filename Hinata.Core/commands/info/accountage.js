const {MessageEmbed} = require('discord.js');
const pm = require('pretty-ms');
const {Servers} = require('../../misc/tools');

module.exports = {
    name: 'accountage',
    aliases: ['aa', 'age'],
    category: 'info',
    description: 'Get someones account age',
    usage: '[command | alias] <mention / id>',
    examples: ['h!age', 'h!age 418037700751261708', 'h!age @Drag0n#6666'],
    cooldown: 10,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let date = new Date();
        let member;

        await Servers.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        if (!member)
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid user ID or mention!'));

        let creation = member.user.createdTimestamp;

        let age = date.getTime() - creation;

        let agestr = pm(age, {
            verbose: true,
        });

        embed.setTitle(`Account age of: ${member.user.username}#${member.user.discriminator}`)
            .setDescription(`**${member.user.username}#${member.user.discriminator}**'s account is **${agestr}** old`);

        await message.channel.send(embed);
    }
}