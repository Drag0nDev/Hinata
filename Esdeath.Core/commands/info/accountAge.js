const {MessageEmbed} = require('discord.js');
const pm = require('pretty-ms');

module.exports = {
    name: 'accountage',
    aliases: ['aa', 'age'],
    category: 'info',
    description: 'Get someones account age',
    usage: '[command | alias] <mention / id>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let date = new Date();

        let member = !args[0] ? message.guild.members.cache.get(message.author.id) : message.mentions.members.first() || message.guild.members.cache.get(args[0]);

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