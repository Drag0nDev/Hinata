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
        const sjl = {
            send: async (msg) => {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal),
            chan: new RegExp('[0-9]{17,}'),
            user: message.author,
            guild: message.guild,
        };

        if (!args[0]) {
            sjl.channel = await sjl.guild.channels.create('join-leave-log', {
                type: "text",
                permissionOverwrites: [
                    {
                        id: sjl.user.id,
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
            });

            sjl.embed.setTitle('Set join/leave log')
                .setColor(bot.embedColors.embeds.normal)
                .setDescription(`New join/leave log created with name <#${sjl.channel.id}>`);


            sjl.joinLeaveLogChannel = await sjl.channel.createWebhook('Hinata', {
                avatar: bot.user.avatarURL({
                    dynamic: true,
                    size: 4096
                })
            }).id;
        } else {
            if (!sjl.chan.test(args[0])) {
                return sjl.embed.setTitle('Set join/leave log')
                    .setColor(bot.embedColors.embeds.error)
                    .setDescription('Please provide a valid id');
            }

            sjl.channel = sjl.guild.channels.cache.get(sjl.chan.exec(args[0])[0]);

            if (!sjl.channel) {
                return sjl.embed.setTitle('Set join/leave log')
                    .setColor(bot.embedColors.embeds.error)
                    .setDescription('Please provide a valid id');
            }

            sjl.joinLeaveLogChannel = await sjl.channel.createWebhook('Hinata', {
                avatar: bot.user.avatarURL({
                    dynamic: true,
                    size: 4096
                })
            }).id;

            sjl.embed.setTitle('Set join/leave log')
                .setColor(bot.embedColors.embeds.normal)
                .setDescription(`join/leave log channel set to <#${sjl.channel.id}>`);
        }

        await ServerSettings.findOne({
            where: {
                serverId: sjl.guild.id
            }
        }).then(async server => {
            server.joinLeaveLogChannel = sjl.joinLeaveLogChannel;

            server.save();
        });

        await sjl.send(sjl.embed);
    }
}