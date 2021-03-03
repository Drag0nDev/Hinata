const {MessageEmbed} = require('discord.js');
const {Permissions} = require('../../misc/tools');
let neededPerm = ['MANAGE_EMOJIS'];

module.exports = {
    name: 'emojidelete',
    aliases: ['ed'],
    category: 'emojis',
    description: 'delete an emoji from the server emoji list',
    usage: '[command | alias] [name/id]',
    examples: ['h!ed Laughing'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        const emoji = {
            send: async function (msg) {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setTitle('Emoji delete')
                .setColor(bot.embedColors.normal)
                .setTimestamp(),
            colors: {
                normal: bot.embedColors.normal,
                error: bot.embedColors.error
            },
            emoji: await message.guild.emojis.cache.find(emoji => emoji.name === args[0])
        };

        //check permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, emoji.embed);
        if (noUserPermission)
            return await emoji.send(emoji.embed);

        let noBotPermission = Permissions.checkBotPermissions(bot, message, neededPerm, emoji.embed);
        if (noBotPermission)
            return emoji.send(emoji.embed);

        if (!emoji.emoji) {
            emoji.embed.setDescription(`No emoji with name **${args[0]}** found!`)
                .setColor(emoji.colors.error);
            return emoji.send(emoji.embed);
        }

        await emoji.emoji.delete();

        emoji.embed.setDescription(`The emoji **${args[0]}** was successfully deleted!`);

        await emoji.send(emoji.embed);
    }
}