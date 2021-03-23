const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');
const neededPerm = ['MANAGE_CHANNELS', 'MANAGE_WEBHOOKS'];

module.exports = {
    name: 'setjoinleavelog',
    aliases: ['sjll', 'joinleavelog'],
    category: 'logging',
    description: 'Assign or create a join/leave log channel for Hinata.',
    usage: '[command | alias] <channelID>',
    examples: ['h!sjll', 'h!sjll 763039768870649856', 'h!sjll #join-leave-log'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        const chan = new RegExp('[0-9]{17,}');
        let user = message.author;
        let guild = message.guild;
        let $channel;
        let joinLeaveLogChannel;

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
                $channel = channel;

                embed.setTitle('Set join/leave log')
                    .setColor(bot.embedColors.normal)
                    .setDescription(`New join/leave log created with name <#${channel.id}>`);
            });

            await $channel.createWebhook('Hinata', {
                avatar: bot.user.avatarURL({
                    dynamic: true,
                    size: 4096
                })
            }).then(hook => {
                joinLeaveLogChannel = hook.id;
            });
        } else {
            if (!chan.test(args[0])) {
                return embed.setTitle('Set join/leave log')
                    .setColor(bot.embedColors.error)
                    .setDescription('Please provide a valid id');
            }

            let channel = guild.channels.cache.get(chan.exec(args[0])[0]);

            if (!channel) {
                return embed.setTitle('Set join/leave log')
                    .setColor(bot.embedColors.error)
                    .setDescription('Please provide a valid id');
            }

            await channel.createWebhook('Hinata', {
                avatar: bot.user.avatarURL({
                    dynamic: true,
                    size: 4096
                })
            }).then(hook => {
                joinLeaveLogChannel = hook.id;
            });

            embed.setTitle('Set join/leave log')
                .setColor(bot.embedColors.normal)
                .setDescription(`join/leave log channel set to <#${channel.id}>`);
        }

        await ServerSettings.findOne({
            where: {
                serverId: guild.id
            }
        }).then(async server => {
            server.joinLeaveLogChannel = joinLeaveLogChannel;

            server.save();
        });

        await message.channel.send(embed);
    }
}