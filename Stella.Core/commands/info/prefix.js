const config = require("../../../config.json");
const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');

module.exports = {
    name: 'prefix',
    category: 'info',
    description: 'Get the prefix for the bot',
    usage: '[command]',
    run: async (bot, message) => {
        const embed = new MessageEmbed().setTitle('prefix')
            .setColor(bot.embedColors.normal)
            .setTimestamp()
            .addField('Global prefixes', config.prefix.join('\n'), true);

        await ServerSettings.findOne({
            where: {
                serverId: message.guild.id
            }
        }).then(server => {
            if (!server.prefix) return;

            embed.addField('Server prefix', server.prefix, true);
        });

        await message.channel.send(embed).catch(console.error);
    }
}