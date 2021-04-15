const {MessageEmbed} = require('discord.js');
const {Permissions} = require('../../misc/tools');

module.exports = {
    name: 'emoji',
    aliases: ['e'],
    category: 'emojis',
    description: 'Show a bigger version of a server emoji.\n' +
        'Only works with 1 emoji.\n' +
        'Does not work with general emojis',
    usage: '[command | alias] [name/id]',
    cooldown: 10,
    run: async (bot, message, args) => {
        const emoji = {
            send: async function (msg) {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setTitle('Emoji')
                .setColor(bot.embedColors.embeds.normal)
                .setTimestamp(),
            colors: {
                normal: bot.embedColors.embeds.normal,
                error: bot.embedColors.embeds.error
            },
            regs: {
                emoji: new RegExp('<a:.+?:\\d+>|<:.+?:\\d+>'),
                animated: new RegExp('<a:.+?:\\d+>'),
                id: new RegExp('\\d+'),
                name: new RegExp(':.+?:'),
                replace: new RegExp(':', 'g')
            },
            str: args[0],
            emoji: {
                name: '',
                link: ''
            }
        };

        if (!emoji.regs.emoji.test(emoji.str)) {
            emoji.embed.setDescription('Please provide a valid emoji.')
                .setColor(emoji.colors.error);

            return emoji.send(emoji.embed);
        }

        if (emoji.regs.animated.test(emoji.str)) {
            emoji.emoji.link = `https://cdn.discordapp.com/emojis/${emoji.regs.id.exec(emoji.regs.animated.exec(emoji.str)[0])}.gif`;
        } else {
            emoji.emoji.link = `https://cdn.discordapp.com/emojis/${emoji.regs.id.exec(emoji.regs.emoji.exec(emoji.str)[0])}.png`;
        }

        emoji.emoji.name = emoji.regs.name.exec(emoji.regs.emoji.exec(emoji.str)[0])[0].replace(emoji.regs.replace, '');

        emoji.embed.setDescription(`Emoji: **${emoji.emoji.name}**`)
            .setImage(emoji.emoji.link);

        await emoji.send(emoji.embed);
    }
}