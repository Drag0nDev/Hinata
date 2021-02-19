const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'ping',
    category: 'info',
    description: 'Show response time of the bot',
    usage: '[command | alias]',
    examples: ['h!ping'],
    run: async (bot, message, args) => {
        let ping = Date.now() - message.createdTimestamp;
        if (ping < 0) ping *= -1;

        const embed = new MessageEmbed().setTitle('Ping')
            .setColor(bot.embedColors.normal)
            .setDescription(`\`${ping}\``)
            .setTimestamp();

        await message.channel.send(embed);
    }
}