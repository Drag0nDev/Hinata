const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'howgay',
    aliases: ['gayrate'],
    category: 'fun',
    description: 'Calculates how gay someone is',
    usage: '[command | alias] <mention user>',
    run: (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('howgay')
            .setColor('#85C1E9')
            .setDescription('Calculating')
            .setTimestamp();

        if (message.mentions.members.first()) {
            let arg = args;

            message.channel.send(embed).then((msg) => {
                embed.setDescription(`${arg} is ${getRandomInt(100)}% gay!`);
                setTimeout(function (){
                    msg.edit(embed);
                }, 1250);
            });
        } else {
            message.channel.send(embed).then((msg) => {
                embed.setDescription(`${message.author} is ${getRandomInt(100)}% gay!`);
                setTimeout(function () {
                    msg.edit(embed);
                }, 1250);
            });
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}