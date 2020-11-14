const delay = require("delay");
const {MessageEmbed} = require('discord.js');
const tools = require('../../../tools');

module.exports = {
    name: 'simprate',
    aliases: ['howsimp'],
    category: 'fun',
    description: 'Get the simprate of a person',
    usage: '[command | alias] <user mention>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed()
            .setTitle('simprate')
            .setColor(bot.embedColors.normal)
            .setDescription('Calculating');

        let msg = await message.channel.send(embed);

        let member;

        await tools.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        if (!member)
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid user ID or mention!'));

        let simprate = getRandomInt(100);

        await delay(1250);

        let editEmbed = new MessageEmbed()
            .setTitle('simprate')
            .setColor(bot.embedColors.normal)
            .setDescription(`**${member.user.tag}** is ${simprate}% simp!`);

        if (simprate > 50)
            editEmbed.setImage('https://media1.tenor.com/images/b5cfc5d13e8640543a528c5da6412e8e/tenor.gif');

        await msg.edit(editEmbed);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}