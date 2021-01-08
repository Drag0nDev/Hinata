const {MessageEmbed} = require('discord.js');

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'deletechannel',
    aliases: ['dc', 'delchan'],
    category: 'manage server',
    description: 'delete any channel in the server with a simple command',
    usage: '[command | alias] [channel id]',
    neededPermissions: ['MANAGE_CHANNELS'],
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let neededPerm = 'MANAGE_CHANNELS';

        if (!message.member.hasPermission(neededPerm))
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription(`You don't have the required permission to run this command\n` +
                    `**Missing requirements:** ${neededPerm}`));

        if (!message.guild.me.hasPermission(neededPerm))
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription(`I don't have the required permission to run this command\n` +
                    `**Missing requirements:** ${neededPerm}`));

        if (!args[0])
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription(`Please provide a channelId`));

        if (isNaN(parseInt(args[0]))){
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription(`Please provide a valid channelId`));
        }

        let channel = message.guild.channels.cache.get(args[0]);

        channel.delete();

        embed.setDescription(`${channel.type.charAt(0).toUpperCase() + channel.type.slice(1)} channel **${channel.name}** has been deleted successfully`);
        await message.channel.send(embed);
    }
}