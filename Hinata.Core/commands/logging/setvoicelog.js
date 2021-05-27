const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');
const neededPerm = ['MANAGE_CHANNELS', 'MANAGE_WEBHOOKS'];

module.exports = {
    name: 'setvoicelog',
    aliases: ['svl', 'voicelog'],
    category: 'logging',
    description: 'Assign or create a voice log channel for Hinata.',
    usage: '[command | alias] <channelID>',
    examples: ['h!svl', 'h!svl 763039768870649856', 'h!svl #voice-log'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        const svl = {
            send: async (msg) => {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal),
            chan: new RegExp('[0-9]{17,}'),
            user: message.author,
            guild: message.guild,
        };

        svl.db = await ServerSettings.findOne({
            where: {
                serverId: svl.guild.id
            }
        });

        if (!args[0]) {
            svl.channel = await svl.guild.channels.create('voice-log', {
                type: "text",
                permissionOverwrites: [
                    {
                        id: svl.user.id,
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

                svl.embed.setTitle('Set voice log')
                    .setColor(bot.embedColors.embeds.normal)
                    .setDescription(`New voice log created with name <#${svl.channel.id}>`);

            svl.voiceLogChannel = await svl.channel.createWebhook('Hinata', {
                avatar: bot.user.avatarURL({
                    dynamic: true,
                    size: 4096
                })
            }).id;
        } else {
            if (!svl.chan.test(args[0])) {
                return svl.embed.setTitle('Set voice log')
                    .setColor(bot.embedColors.embeds.error)
                    .setDescription('Please provide a valid id');
            }

            svl.channel = svl.guild.channels.cache.get(svl.chan.exec(args[0])[0]);

            if (!svl.channel) {
                return svl.embed.setTitle('Set voice log')
                    .setColor(bot.embedColors.embeds.error)
                    .setDescription('Please provide a valid id');
            }

            svl.voiceLogChannel = await svl.channel.createWebhook('Hinata', {
                avatar: bot.user.avatarURL({
                    dynamic: true,
                    size: 4096
                })
            }).id;

            svl.embed.setTitle('Set voice log')
                .setColor(bot.embedColors.embeds.normal)
                .setDescription(`Voice log channel set to <#${svl.channel.id}>`);
        }

        svl.db.memberLogChannel = svl.memberLogChannel.id;

        svl.db.save();

        await svl.send(svl.embed);
    }
}