const config = require("../../../config.json");
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'settesting',
    aliases: ['st', 'testing'],
    category: 'owner',
    description: 'Change the state from online to testing',
    usage: '[command | alias]',
    run: async (bot, message) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);

        if (message.member.id !== config.owner)
            return;

        bot.testing = !bot.testing;

        embed.setDescription(`Set the testing value from **${!bot.testing}** to **${bot.testing}**`);
        await bot.user.setPresence({ activity: {
            name: 'Problems being fixed',
            type: "PLAYING"
            },
            status: 'dnd' });

        await message.channel.send(embed);
    }
}