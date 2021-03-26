const {MessageEmbed} = require('discord.js');
let neededPerm = ['MANAGE_GUILD'];

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'createchannel',
    aliases: ['nc', 'newchannel'],
    category: 'channels',
    description: 'Create a new text channel',
    usage: '[command | alias] [text channel name]',
    examples: ['h!nc rules'],
    neededPermissions: neededPerm,
    //</editor-fold>
    run: async (bot, message, args) => {
        const channel = {
            send: async function (msg) {
                return message.channel.send(msg);
            },
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal),
            user: message.author,
            name: args.join('-'),
            title: 'Create new channel!'
        }


        if (!args[0])
            return channel.send(channel.embed.setColor(bot.embedColors.embeds.error)
                .setDescription('Please provide a name!'));


        await message.guild.channels.create(channel.name,
            {
                type: "text",
                permissionOverwrites: [
                    {
                        id: channel.user.id,
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
            channel.embed.setTitle(channel.title)
                .setColor(bot.embedColors.embeds.normal)
                .setDescription(`New channel created with name **${newChannel.name}**!`);

            channel.send(channel.embed);
        });
    }
}