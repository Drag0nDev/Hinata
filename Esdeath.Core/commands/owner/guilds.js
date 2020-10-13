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
            embed.setColor(bot.embedColors.error)
                .setDescription('This command is only for my owner!');
        } else {
            bot.guilds.cache.forEach(guild => {
                embed.setColor(bot.embedColors.normal)
                    .addField(guild.name, `Member count: ${guild.memberCount}` + '\n' +
                    `Server ID: ${guild.id}`, true);
            });
        }

        await message.channel.send(embed);
    }
}