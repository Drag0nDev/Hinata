const config = require("../../../config.json");
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'bonk',
    category: 'fun',
    description: 'Bonk a user',
    usage: '[command | alias] [mention user]',
    run: (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('bonk')
            .setTimestamp()
            .setColor('#85C1E9');

        if (message.mentions.members.first()) {
            if (args[0] === `<@!${config.OWNER}>`) {
                embed.setDescription(`${message.author} <a:bonk:735549944814895115>, don't bonk my master!`);
            } else {
                embed.setDescription(`${args[0]} <a:bonk:735549944814895115>`);
            }
        } else {
            embed.setDescription('Please mention a user!');
        }

        message.channel.send(embed);
    }
}