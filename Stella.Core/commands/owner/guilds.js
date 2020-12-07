const config = require("../../../config.json")
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'guilds',
    category: 'owner',
    description: 'Displaying all joined guilds with their respective member count',
    usage: '[command | alias]',
    run: async (bot, message) => {
        let embed = new MessageEmbed().setTitle('Guilds').setColor(bot.embedColors.normal);

        if (!(message.member.id === config.owner))
            return message.channel.send(embed.setDescription(`${message.author} this is a command only for my creator!`)
                .setColor(bot.embedColors.error));

        bot.guilds.cache.forEach(guild => {
            embed.addField(guild.name, `Member count: ${guild.memberCount}` + '\n' +
                `Server ID: ${guild.id}`, true);
        });


        await message.channel.send(embed);
    }
}