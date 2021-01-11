const {MessageEmbed} = require('discord.js');
const tools = require("../../misc/tools");

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'createcategory',
    aliases: ['cc', 'newcategory'],
    category: 'manage server',
    description: 'Create a new category',
    usage: '[command | alias] [category name]',
    neededPermissions: ['MANAGE_CHANNELS'],
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let neededPerm = ['MANAGE_CHANNELS'];
        let user = message.author;

        const catName = args.join(' ');
        const title = 'Create new category!';
        const channel = message.channel;

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
                type: "category",
                permissionOverwrites: [
                    {
                        id: user.id,
                        allow: ['VIEW_CHANNEL', "MANAGE_CHANNELS"],
                    },
                    {
                        id: bot.user.id,
                        allow: ['VIEW_CHANNEL', "MANAGE_CHANNELS"],
                    }
                ]
            }).then(newChannel => {

            embed.setTitle(title)
                .setColor(bot.embedColors.normal)
                .setDescription(`New categoty created with name **${catName}**!`);

            channel.send(embed);
        });
    }
}