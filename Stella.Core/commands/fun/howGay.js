const {MessageEmbed} = require('discord.js');
const delay = require("delay");
const tools = require('../../../tools');

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

        let member;

        await tools.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        if (!member)
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid user ID or mention!'));

        let gayrate = getRandomInt(100);

        let msg = await message.channel.send(embed);
        await delay(1250);

        embed.setDescription(`**${member.user.tag}** is ${gayrate}% gay!`);

        if (gayrate > 50)
            embed.setImage('https://media1.tenor.com/images/07ca40330ec6b96b50de2f7539ca718d/tenor.gif');

        await msg.edit(embed);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}