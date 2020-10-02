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
            .setColor('#85C1E9')
            .setTitle('Dragon')
            .setTimestamp();

        if(message.member.id === config.OWNER)
            embed.setDescription(`Hello master.\nYou are the best <@${config.OWNER}>!!! <:heart_diamond:738026632891334677>`)
                .setImage('https://media1.tenor.com/images/be48d6abbe29fefd1bf85d07bbe395d5/tenor.gif?itemid=5525035');
        else
            embed.setDescription('My owner is the coolest! <:heart_diamond:738026632891334677>')


        await message.channel.send(embed);
    }
}