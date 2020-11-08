const delay = require("delay");
const {MessageEmbed} = require('discord.js');
const tools = require('../../../tools');

module.exports = {
    name: 'getip',
    aliases: ['gi'],
    category: 'fun',
    description: 'Get a users ip (not really)',
    usage: '[command | alias] [mention user]',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed()
            .setTitle('getip')

        let member;

        await tools.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        if (!member)
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid user ID or mention!'));

        embed.setImage('https://media1.tenor.com/images/b7cd57136bb82a1784bedc5408149eb1/tenor.gif?itemid=13247943')
            .setDescription('Getting ip ...')
            .setColor(bot.embedColors.normal);

        let msg = await message.channel.send(embed);
        await delay(1250);

        embed.setDescription(`${member.user.tag}'s IP: **${getRandomInt(255)}.${getRandomInt(255)}.${getRandomInt(255)}.${getRandomInt(255)}**`)
            .setImage('');

        await msg.edit(embed);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}