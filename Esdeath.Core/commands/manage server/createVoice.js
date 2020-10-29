const {MessageEmbed} = require('discord.js');

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'createvoice',
    aliases: ['cv', 'newvoice'],
    category: 'Manage server',
    description: 'Create a new voice channel',
    usage: '[command | alias] [voice channel name]',
    neededPermissions: ['MANAGE_CHANNELS'],
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let neededPerm = 'MANAGE_CHANNELS';
        let user = message.author;

        const catName = args.join(' ');
        const title = 'Create new voice channel!';
        const channel = message.channel;

        if (!args[0])
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a name!'));

        if (!message.member.hasPermission(neededPerm))
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription(`You don't have the required permission to run this command\n` +
                    `**Missing requirements:** ${neededPerm}`));

        if (!message.guild.me.hasPermission(neededPerm))
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription(`I don't have the required permission to run this command\n` +
                    `**Missing requirements:** ${neededPerm}`));

        await message.guild.channels.create(catName,
            {
                type: "voice",
                permissionOverwrites: [
                    {
                        id: user.id,
                        allow: ['VIEW_CHANNEL', "MANAGE_CHANNELS"],
                    },
                    {
                        id: bot.user.id,
                        allow: ['VIEW_CHANNEL', "MANAGE_CHANNELS"],
                    },
                    {
                        id: message.guild.roles.everyone,
                        deny: ['VIEW_CHANNEL'],
                    }
                ]
            }).then(newChannel => {

            embed.setTitle(title)
                .setColor(bot.embedColors.normal)
                .setDescription(`New voice channel created with name **${catName}**!`);

            channel.send(embed);
        });
    }
}