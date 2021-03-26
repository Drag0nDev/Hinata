const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');
const neededPerm = ['MANAGE_CHANNELS', 'MANAGE_WEBHOOKS'];

module.exports = {
    name: 'setserverlog',
    aliases: ['ssl', 'serverlog'],
    category: 'logging',
    description: 'Assign or create a server log channel for Hinata.',
    usage: '[command | alias] <channelID>',
    examples: ['h!ssl', 'h!ssl 763039768870649856', 'h!ssl #server-log'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        const ssl = {
            send: async (msg) => {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal),
            chan: new RegExp('[0-9]{17,}'),
            user: message.author,
            guild: message.guild,
        };

        if (!args[0]) {
            ssl.channel = await ssl.guild.channels.create('server-log', {
                type: "text",
                permissionOverwrites: [
                    {
                        id: ssl.user.id,
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

            ssl.embed.setTitle('Set server log')
                .setColor(bot.embedColors.embeds.normal)
                .setDescription(`New server log created with name <#${ssl.channel.id}>`);

            ssl.serverLogChannel = await ssl.channel.createWebhook('Hinata', {
                avatar: bot.user.avatarURL({
                    dynamic: true,
                    size: 4096
                })
            }).id;
        } else {
            if (!ssl.chan.test(args[0])) {
                return ssl.embed.setTitle('Set server log')
                    .setColor(bot.embedColors.embeds.error)
                    .setDescription('Please provide a valid id');
            }

            ssl.channel = ssl.guild.channels.cache.get(ssl.chan.exec(args[0])[0]);

            if (!ssl.channel) {
                return ssl.embed.setTitle('Set server log')
                    .setColor(bot.embedColors.embeds.error)
                    .setDescription('Please provide a valid id');
            }

            ssl.serverLogChannel = await ssl.channel.createWebhook('Hinata', {
                avatar: bot.user.avatarURL({
                    dynamic: true,
                    size: 4096
                })
            }).id;

            ssl.embed.setTitle('Set server log')
                .setColor(bot.embedColors.embeds.normal)
                .setDescription(`Server log channel set to <#${ssl.channel.id}>`);
        }

        await ServerSettings.findOne({
            where: {
                serverId: ssl.guild.id
            }
        }).then(async server => {
            server.serverLogChannel = ssl.serverLogChannel;

            server.save();
        });

        await ssl.send(ssl.embed);
    }
}