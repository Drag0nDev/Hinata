const {MessageEmbed} = require('discord.js');
let neededPerm = ['MANAGE_GUILD'];

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'createvoice',
    aliases: ['cv', 'newvoice'],
    category: 'server settings',
    description: 'Create a new voice channel',
    usage: '[command | alias] [voice channel name]',
    neededPermissions: neededPerm,
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let neededPerm = 'MANAGE_CHANNELS';
        let user = message.author;

        const catName = args.join(' ');
        const title = 'Create new voice channel!';
        const channel = message.channel;

        //check member and bot permissions
        let noUserPermission = tools.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = tools.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        if (!args[0])
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a name!'));

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