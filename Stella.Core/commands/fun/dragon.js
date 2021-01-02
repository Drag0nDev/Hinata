const config = require("../../../config.json");
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'dragon',
    aliases: ["d"],
    category: 'fun',
    description: 'A mysterious command',
    usage: '[command | alias]',
    run: async (bot, message) => {
        let embed = new MessageEmbed()
            .setColor(bot.embedColors.normal)
            .setTitle('Dragon')
            .setTimestamp();

        if(message.member.id === config.owner)
            embed.setDescription(`Hello master.\nYou are the best <@${config.owner}>!!! <:heart_diamond:738026632891334677>`)
                .setImage('https://i.imgur.com/Irflkny.gif');
        else
            embed.setDescription('My owner is the coolest! <:heart_diamond:738026632891334677>')


        await message.channel.send(embed);
    }
}