const {MessageEmbed} = require('discord.js');
const delay = require("delay");
const {Servers} = require('../../misc/tools');

module.exports = {
    name: 'howgay',
    aliases: ['gayrate'],
    category: 'fun',
    description: 'Calculates how gay someone is',
    usage: '[command | alias] <mention user>',
    examples: ['h!howgay', 'h!howgay 418037700751261708', 'h!howgay @Drag0n#6666'],
    cooldown: 10,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('howgay')
            .setColor(bot.embedColors.normal)
            .setDescription('Calculating');

        let member;

        await Servers.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        if (!member)
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid user ID or mention!'));

        let gayrate = getRandomInt(100);

        await message.channel.send(embed).then(async msg => {
            await delay(1250);

            embed.setDescription(`**${member.user.tag}** is ${gayrate}% gay!`);

            if (gayrate > 50)
                embed.setImage('https://media1.tenor.com/images/07ca40330ec6b96b50de2f7539ca718d/tenor.gif');

            await msg.edit(embed);
        });
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}