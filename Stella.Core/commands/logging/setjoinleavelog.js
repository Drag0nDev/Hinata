const tools = require("../../misc/tools");
const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');
const neededPerm = ['MANAGE_CHANNELS'];

module.exports = {
    name: 'setjoinleavelog',
    aliases: ['sjll', 'joinleavelog'],
    category: 'logging',
    description: 'Assign or create a join/leave log channel for Stella.',
    usage: '[command | alias] <channelID>',
    examples: ['s!sjll', 's!sjll 763039768870649856', 's!sjll #join-leave-log'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        const chan = new RegExp('[0-9]{17,}');
        let user = message.author;
        let guild = message.guild;

        let noUserPermission = tools.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = tools.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        await ServerSettings.findOne({
            where: {
                serverId: guild.id
            }
        }).then(async server => {
            if (!args[0]) {
                await guild.channels.create('join-leave-log', {
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
                    server.joinLeaveLogChannel = channel.id;

                    embed.setTitle('Set join/leave log')
                        .setColor(bot.embedColors.normal)
                        .setDescription(`New join/leave log created with name <#${channel.id}>`);
                });
            } else {
                if (!chan.test(args[0])) {
                    return embed.setTitle('Set join/leave log')
                        .setColor(bot.embedColors.error)
                        .setDescription('Please provide a valid id');
                }

                let channel = guild.channels.cache.get(chan.exec(args[0])[0]);

                if (!channel){
                    return embed.setTitle('Set join/leave log')
                        .setColor(bot.embedColors.error)
                        .setDescription('Please provide a valid id');
                }

                server.joinLeaveLogChannel = channel.id;

                embed.setTitle('Set join/leave log')
                    .setColor(bot.embedColors.normal)
                    .setDescription(`join/leave log channel set to <#${channel.id}>`);
            }

            server.save();
        });

        await message.channel.send(embed);
    }
}