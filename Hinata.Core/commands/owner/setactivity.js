const config = require("../../../config.json");
const {Permissions} = require('../../misc/tools');
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'setactivity',
    aliases: ['activity'],
    category: 'owner',
    description: 'Change the displayed activity of Esdeath.',
    usage: '[command | alias] [type (streaming|watching|listening)] [text]',
    ownerOnly: true,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed()

        //splitting in to parts
        const type = args.shift().toUpperCase();
        if (type === 'STREAMING') {
            const link = args.pop();

            const name = args.join(' ');

            await bot.user.setActivity({
                name: `${name}`,
                type: `${type}`,
                url: `${link}`
            });
        } else if (type === 'DEFAULT') {
            await bot.user.setActivity({
                name: 'Under construction',
                type: 'STREAMING',
                url: 'https://www.twitch.tv/zwoil'
            });
        } else {
            const name = args.join(' ');

            await bot.user.setActivity({
                name: `${name}`,
                type: `${type}`
            });
        }

        embed.setDescription('Activity changed successfully!')
            .setColor(bot.embedColors.normal);

        await message.channel.send(embed);

    }
}