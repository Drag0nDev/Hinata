const {MessageEmbed} = require('discord.js');
const {Servers} = require("../../misc/tools");

module.exports = {
    name: 'avatar',
    aliases: ['av', 'pfp'],
    category: 'info',
    description: 'Get the avatar of yourself/another person',
    usage: '[command | alias] <mention/id>',
    examples: ['h!av', 'h!av 418037700751261708', 'h!av @Drag0n#6666'],
    cooldown: 10,
    run: async (bot, message, args) => {
        const avatar = {
            send: async (msg) => {
                return message.channel.send(msg);
            },
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal)
        };

        //find the member if one is asked if not then use the author
        avatar.member = await Servers.getMember(message, args);

        if (!avatar.member)
            return avatar.send(avatar.embed.setColor(bot.embedColors.embeds.error)
                .setDescription('Please provide a valid user ID or mention!'));

        avatar.embed.setTitle(`avatar of: ${avatar.member.user.username}#${avatar.member.user.discriminator}`)
            .setImage(avatar.member.user.avatarURL({
                dynamic: true,
                size: 4096
            }));

        await avatar.send(avatar.embed);
    }
}