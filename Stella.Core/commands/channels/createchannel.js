const {MessageEmbed} = require('discord.js');
let neededPerm = ['MANAGE_GUILD'];
const {Permissions} = require('../../misc/tools');

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'createchannel',
    aliases: ['nc', 'newchannel'],
    category: 'channels',
    description: 'Create a new text channel',
    usage: '[command | alias] [text channel name]',
    examples: ['s!nc rules'],
    neededPermissions: neededPerm,
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let user = message.author;

        const name = args.join('-');
        const title = 'Create new channel!';
        const channel = message.channel;

        //check member and bot permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = Permissions.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        if (!args[0])
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a name!'));


        await message.guild.channels.create(name,
            {
                type: "text",
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
                .setDescription(`New channel created with name **${newChannel.name}**!`);

            channel.send(embed);
        });
    }
}