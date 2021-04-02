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
        const age = {
            send: async (msg) => {
                return message.channel.send(msg);
            },
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal),
            date: new Date(),
            age: {}
        }

        age.member = await Servers.getMember(message, args);

        if (!age.member)
            return message.channel.send(age.embed.setColor(bot.embedColors.embeds.error)
                .setDescription('Please provide a valid user ID or mention!'));

        age.age.creation = age.member.user.createdTimestamp;

        age.age.age = age.date.getTime() - age.age.creation;

        age.agestr = pm(age.age.age, {
            verbose: true,
        });

        age.embed.setTitle(`Account age of: ${age.member.user.username}#${age.member.user.discriminator}`)
            .setDescription(`**${age.member.user.username}#${age.member.user.discriminator}**'s account is **${age.agestr}** old`);

        await age.send(age.embed);
    }
}