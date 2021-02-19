const {MessageEmbed} = require('discord.js');
const {Permissions} = require('../../misc/tools');
let neededPerm = ['MANAGE_GUILD'];

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'deletechannel',
    aliases: ['dc', 'delchan'],
    category: 'channels',
    description: 'delete any channel in the server with a simple command',
    usage: '[command | alias] [channel id]',
    examples: ['h!cc 762241328599269396'],
    neededPermissions: neededPerm,
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);

        //check member and bot permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = Permissions.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

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