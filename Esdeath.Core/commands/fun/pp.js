const delay = require("delay");
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'pp',
    aliases: ['penis', 'howbig', 'pickle'],
    category: 'fun',
    description: 'Shows how long someones pp is',
    usage: '[command | alias] <user mention>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('howgay')
            .setColor(bot.embedColors.normal)
            .setDescription('Looking')

        if (message.mentions.members.first()) {
            let member = message.mentions.members.first();

            let msg = await message.channel.send(embed);
            await delay(1250);

            embed.setDescription(`**${member.user.tag}**'s pp:\n**${GetPP()}**`);

            await msg.edit(embed);
        } else {
            let msg = await message.channel.send(embed);
            await delay(1250);

            embed.setDescription(`**${message.author.tag}**'s pp:\n**${GetPP()}**`);

            await msg.edit(embed);
        }
    }
}

function GetPP() {
    let length = '8';
    for (let i = 0; i < getRandomInt(1000) % 20; i++) {
        length += '=';
    }
    return length+'D';
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}