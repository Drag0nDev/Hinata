const config = require("../../../config.json");
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'perfix',
    category: 'info',
    description: 'Get the prefix for the bot',
    usage: 'esdeath prefix',
    run: async (bot, message) => {
        const embed = new MessageEmbed().setTitle('prefix')
            .setColor('#85C1E9')
            .setDescription(`My prefix is **${config.prefix}**.`)
            .setTimestamp();

        await message.channel.send(embed).catch(console.error);
    }
}