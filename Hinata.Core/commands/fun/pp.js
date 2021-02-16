const delay = require("delay");
const {MessageEmbed} = require('discord.js');
const {Servers} = require('../../misc/tools');

module.exports = {
    name: 'pp',
    aliases: ['penis', 'howbig', 'pickle'],
    category: 'fun',
    description: 'Shows how long someones pp is',
    usage: '[command | alias] <user mention>',
    examples: ['h!pp', 'h!pp 418037700751261708', 'h!pp @Drag0n#6666'],
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('PP')
            .setColor(bot.embedColors.normal)
            .setDescription('Looking')

        let member;

        await Servers.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        if (!member)
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid user ID or mention!'));

        await message.channel.send(embed).then(async msg => {
            await delay(1250);

            embed.setDescription(`**${member.user.tag}**'s pp:\n**${GetPP()}**`);

            await msg.edit(embed);
        });

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