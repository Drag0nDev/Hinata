let neededPermissions = ['MANAGE_CHANNELS'];
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'setnsfw',
    aliases: ['snsfw'],
    category: 'channels',
    description: 'A command to toggle the nsfw mark on a channel',
    usage: '[command | alias]',
    neededPermissions: neededPermissions,
    run: async (bot, message) => {
        const embed = new MessageEmbed()
            .setColor(bot.embedColors.embeds.normal)
            .setTitle('Set NSFW')
            .setTimestamp();

        if (message.channel.nsfw) {
            message.channel.edit({
                nsfw: false
            });

            embed.setDescription('The channel is now marked as SFW');

            message.channel.send(embed);
        } else {
            message.channel.edit({
                nsfw: true
            });

            embed.setDescription('The channel is now marked as NSFW');

            message.channel.send(embed);
        }
    }
}