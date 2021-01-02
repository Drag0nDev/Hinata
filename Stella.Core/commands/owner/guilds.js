const config = require("../../../config.json")
const tools = require("../../../tools");
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'guilds',
    category: 'owner',
    description: 'Displaying all joined guilds with their respective member count',
    usage: '[command | alias]',
    run: async (bot, message) => {
        let embed = new MessageEmbed().setTitle('Guilds').setColor(bot.embedColors.normal);

        if (message.author.id !== config.owner) {
            tools.ownerOnly(bot, message.channel)
            return;
        }

        bot.guilds.cache.forEach(guild => {
            embed.addField(guild.name, `Member count: ${guild.memberCount}` + '\n' +
                `Server ID: ${guild.id}`, true);
        });


        await message.channel.send(embed);
    }
}