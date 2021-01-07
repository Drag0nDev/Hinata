const delay = require("delay");
const {MessageEmbed} = require('discord.js');
const tools = require('../../misc/tools');

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

        let member;

        await tools.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        if (!member)
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid user ID or mention!'));

        let msg = await message.channel.send(embed);
        await delay(1250);

        embed.setDescription(`**${member.user.tag}**'s pp:\n**${GetPP()}**`);

        await msg.edit(embed);
    }
}

function GetPP() {
    let length = '8';
    for (let i = 0; i < getRandomInt(1000) % 20; i++) {
        length += '=';
    }
    return length + 'D';
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}