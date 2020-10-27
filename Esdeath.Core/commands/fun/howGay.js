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
            .setColor(bot.embedColors.normal)
            .setDescription('Calculating');

        if (message.mentions.members.first()) {
            let member = message.mentions.members.first();
            let gayrate = getRandomInt(100);

            let msg = await message.channel.send(embed);
            await delay(1250);

            embed.setDescription(`**${member.user.tag}** is ${gayrate}% gay!`);

            if (gayrate > 50)
                embed.setImage('https://media1.tenor.com/images/07ca40330ec6b96b50de2f7539ca718d/tenor.gif');

            await msg.edit(embed);
        } else {
            let msg = await message.channel.send(embed);
            let gayrate = getRandomInt(100);

            await delay(1250);

            embed.setDescription(`**${message.author.tag}** is ${gayrate}% gay!`);

            if (gayrate > 50)
                embed.setImage('https://media1.tenor.com/images/07ca40330ec6b96b50de2f7539ca718d/tenor.gif');

            await msg.edit(embed);
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}