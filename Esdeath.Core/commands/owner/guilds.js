const config = require("../../../config.json")
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'guilds',
    category: 'owner',
    description: 'Displaying all joined guilds with their respective member count',
    usage: '[command | alias]',
    run: async (bot, message) => {
        let embed = new MessageEmbed().setTitle('Guilds');

        if (!(message.member.id === config.OWNER)) {
            embed.setColor('#FF0000')
                .setDescription('This command is only for my owner!');
        } else {
            bot.guilds.cache.forEach(guild => {
                embed.setColor('#85C1E9')
                    .addField(guild.name, `Member count: ${guild.memberCount}`, true);
            });
        }

        await message.channel.send(embed);
    }
}