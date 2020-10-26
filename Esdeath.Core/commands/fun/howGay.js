const {MessageEmbed} = require('discord.js');
const delay = require("delay");

module.exports = {
    name: 'howgay',
    aliases: ['gayrate'],
    category: 'fun',
    description: 'Calculates how gay someone is',
    usage: '[command | alias] <mention user>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('howgay')
            .setColor(bot.embedColors.normal.code)
            .setDescription('Calculating')
            .setTimestamp();

        if (message.mentions.members.first()) {
            let arg = args;
            let msg = await message.channel.send(embed);
            await delay(1250);
            embed.setDescription(`${arg} is ${getRandomInt(100)}% gay!`);
            await msg.edit(embed);
        } else {
            let msg = await message.channel.send(embed);
            await delay(1250);
            embed.setDescription(`${message.author} is ${getRandomInt(100)}% gay!`);
            await msg.edit(embed);
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}