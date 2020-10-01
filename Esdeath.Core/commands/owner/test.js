const config = require("../../../config.json")
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'test',
    category: 'owner',
    description: 'testing file for new stuff',
    usage: '[command | alias]',
    run: (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('test');

        if (!(message.member.id === config.OWNER)) {
            embed.setColor('#FF0000')
                .setDescription('This command is only for my owner!');
        } else {
            bot.guilds.cache.forEach(guild => {
                embed.setColor('#85C1E9')
                    .addField(guild.name, guild.memberCount, true);
            });
        }

        message.channel.send(embed);
    }
}