const {MessageEmbed, MessageCollector} = require('discord.js');

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'createcategory',
    aliases: ['cc', 'newcategory'],
    category: 'Manage server',
    description: 'Create a new category',
    usage: '[command | alias] [category name]',
    neededPermissions: 'MANAGE_CHANNELS',
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal.code);
        let neededPerm = 'MANAGE_CHANNELS';
        let user = message.author;

        const catName = args.join(' ');
        const title = 'Create new category!';
        const channel = message.channel;

        if (!args[0])
            return message.channel.send(embed.setColor(bot.embedColors.error.code)
                .setDescription('Please provide a name!'));

        if (!message.member.hasPermission(neededPerm))
            return message.channel.send(embed.setColor(bot.embedColors.error.code)
                .setDescription(`You don't have the required permission to run this command\n` +
                    `**Missing requirements:** ${neededPerm}`));

        if (!message.guild.me.hasPermission(neededPerm))
            return message.channel.send(embed.setColor(bot.embedColors.error.code)
                .setDescription(`I don't have the required permission to run this command\n` +
                    `**Missing requirements:** ${neededPerm}`));

        await message.guild.channels.create(catName,
            {
                type: "category",
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
                .setColor(bot.embedColors.normal.code)
                .setDescription(`New categoty created with name **${catName}**!`);

            channel.send(embed);
        });
    }
}