const {MessageEmbed} = require('discord.js');
const {Permissions} = require("../../misc/tools");
let neededPerm = ['MANAGE_GUILD'];

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'createcategory',
    aliases: ['cc', 'newcategory'],
    category: 'channels',
    description: 'Create a new category',
    usage: '[command | alias] [category name]',
    examples: ['h!cc info'],
    neededPermissions: neededPerm,
    //</editor-fold>
    run: async (bot, message, args) => {
        const category = {
            send: async function (msg) {
                return message.channel.send(msg);
            },
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal),
            user: message.author,
            name: args.join(' '),
            title: 'Create new category!'
        };

        if (!args[0])
            return category.send(category.embed.setColor(bot.embedColors.embeds.error)
                .setDescription('Please provide a name!'));

        await message.guild.channels.create(category.name,
            {
                type: "category",
                permissionOverwrites: [
                    {
                        id: category.user.id,
                        allow: ['VIEW_CHANNEL', "MANAGE_CHANNELS"],
                    },
                    {
                        id: bot.user.id,
                        allow: ['VIEW_CHANNEL', "MANAGE_CHANNELS"],
                    }
                ]
            }).then(newChannel => {

            category.embed.setTitle(category.title)
                .setColor(bot.embedColors.embeds.normal)
                .setDescription(`New categoty created with name **${category.name}**!`);

            category.send(category.embed);
        });
    }
}