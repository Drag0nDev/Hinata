const config = require("../../../config.json");
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'perfix',
    category: 'info',
    description: 'Get the prefix for the bot',
    usage: 'esdeath prefix',
    run: (bot, message, args) => {
        const embed = new MessageEmbed().setTitle('prefix')
            .setColor('#85C1E9')
            .setDescription(`My prefix is **${config.PREFIX}**.`)
            .setTimestamp();

        message.channel.send(embed).catch(console.error);
    }
}