const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');
const neededPerm = ['MANAGE_CHANNELS', 'MANAGE_WEBHOOKS'];

module.exports = {
    name: 'setmessagelog',
    aliases: ['smsgl', 'messagelog'],
    category: 'logging',
    description: 'Assign or create a message log channel for Hinata.',
    usage: '[command | alias] <channelID>',
    examples: ['h!smsgl', 'h!smsgl 763039768870649856', 'h!smsgl #message-log'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        const sml = {
            send: async (msg) => {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal),
            chan: new RegExp('[0-9]{17,}'),
            user: message.author,
            guild: message.guild,
        };

        sml.db = await ServerSettings.findOne({
            where: {
                serverId: sml.guild.id
            }
        });

        if (!args[0]) {
            sml.channel = await sml.guild.channels.create('message-log', {
                type: "text",
                permissionOverwrites: [
                    {
                        id: sml.user.id,
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

                sml.embed.setTitle('Set message log')
                    .setColor(bot.embedColors.embeds.normal)
                    .setDescription(`New message log created with name <#${sml.channel.id}>`);


            sml.messageLogChannel = await sml.channel.createWebhook('Hinata', {
                avatar: bot.user.avatarURL({
                    dynamic: true,
                    size: 4096
                })
            });
        } else {
            if (!sml.chan.test(args[0])) {
                return sml.embed.setTitle('Set message log')
                    .setColor(bot.embedColors.embeds.error)
                    .setDescription('Please provide a valid id');
            }

            sml.channel = sml.guild.channels.cache.get(sml.chan.exec(args[0])[0]);

            if (!sml.channel) {
                return sml.embed.setTitle('Set message log')
                    .setColor(bot.embedColors.embeds.error)
                    .setDescription('Please provide a valid id');
            }

            sml.messageLogChannel = await sml.channel.createWebhook('Hinata', {
                avatar: bot.user.avatarURL({
                    dynamic: true,
                    size: 4096
                })
            });

            sml.embed.setTitle('Set message log')
                .setColor(bot.embedColors.embeds.normal)
                .setDescription(`Message log channel set to <#${sml.channel.id}>`);
        }

        sml.db.memberLogChannel = sml.memberLogChannel.id;

        sml.db.save();

        await sml.send(sml.embed);
    }
}