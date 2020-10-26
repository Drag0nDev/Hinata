const config = require("../../../config.json");
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'setactivity',
    aliases: ['activity'],
    category: 'owner',
    description: 'Change the displayed activity of Esdeath.',
    usage: '[command | alias] [type (streaming|watching|listening)] [text]',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed()

        if (!(message.member.id === config.OWNER))
            return message.channel.send(embed.setDescription(`${message.author} this is a command only for my creator!`)
                .setColor(bot.embedColors.error));

            //splitting in to parts
            const type = args.shift().toUpperCase();
            if(type === 'STREAMING'){
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