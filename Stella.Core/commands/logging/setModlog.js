const tools = require("../../misc/tools");
const {MessageEmbed} = require('discord.js');
const {Server} = require('../../misc/dbObjects');

module.exports = {
    name: 'setmodlog',
    aliases: ['sm', 'modlogchannel'],
    category: 'logging',
    description: 'Assign or create a modlog channel for Stella.',
    usage: '[command | alias] <channelID>',
    neededPermissions: ['MANAGE_CHANNELS'],
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let neededPerm = 'MANAGE_CHANNELS';
        let user = message.author;
        let guild = message.guild;

        let noUserPermission = tools.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = tools.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        await Server.findOne({
            where: {
                serverId: guild.id
            }
        }).then(async server => {
            if (!args[0]) {
                await guild.channels.create('Modlog', {
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
                }).then(channel => {
                    server.modlogChannel = channel.id;

                    embed.setTitle('Set modlog')
                        .setColor(bot.embedColors.normal)
                        .setDescription(`New modlog created with name <#${channel.id}>`);
                });
            } else {
                if (isNaN(parseInt(args[0]))) {
                    return embed.setTitle('Set modlog')
                        .setColor(bot.embedColors.error)
                        .setDescription('Please provide a valid id');
                }

                let channel = guild.channels.cache.get(args[0])

                if (!channel){
                    return embed.setTitle('Set modlog')
                        .setColor(bot.embedColors.error)
                        .setDescription('Please provide a valid id');
                }

                server.modlogChannel = channel.id;

                embed.setTitle('Set modlog')
                    .setColor(bot.embedColors.normal)
                    .setDescription(`Modlog channel set to <#${channel.id}>`);
            }

            server.save();
        });

        await message.channel.send(embed);
    }
}