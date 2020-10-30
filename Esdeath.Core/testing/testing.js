const {MessageEmbed} = require('discord.js');
const config = require("../../config.json");

module.exports = {
    name: 'testing',
    run: async (bot, message) => {
        let embed = new MessageEmbed().setTitle('Currently out of order!')
            .setColor(bot.embedColors.error)
            .setFooter('Try again later')
            .setDescription('**__I am sorry but currently I am either one of both:__**\n' +
                '**1.** I am locked down because a major bug has appeared that could lead to unwanted behaviour.\n' +
                '**2.** I am under maintenance.\n\n' +
                'I hope you can understand this.\n' +
                'If you want to know when I am back to normal, then join my [support server!](https://discord.gg/ReBJ4AB)')
            .setTimestamp()
            .setThumbnail(bot.user.avatarURL());

        await message.channel.send(embed);
    }
}