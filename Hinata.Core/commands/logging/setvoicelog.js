const {Permissions} = require("../../misc/tools");
const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');
const neededPerm = ['MANAGE_CHANNELS'];

module.exports = {
    name: 'setvoicelog',
    aliases: ['svl', 'voicelog'],
    category: 'logging',
    description: 'Assign or create a voice log channel for Hinata.',
    usage: '[command | alias] <channelID>',
    examples: ['h!svl', 'h!svl 763039768870649856', 'h!svl #voice-log'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        const chan = new RegExp('[0-9]{17,}');
        let user = message.author;
        let guild = message.guild;
        let $channel;
        let voiceLogChannel;

        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = Permissions.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        if (!args[0]) {
            await guild.channels.create('voice-log', {
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

                embed.setTitle('Set voice log')
                    .setColor(bot.embedColors.normal)
                    .setDescription(`New voice log created with name <#${channel.id}>`);
            });

            await $channel.createWebhook('Hinata', {
                avatar: bot.user.avatarURL({
                    dynamic: true,
                    size: 4096
                })
            }).then(hook => {
                voiceLogChannel = hook.id;
            });
        } else {
            if (!chan.test(args[0])) {
                return embed.setTitle('Set voice log')
                    .setColor(bot.embedColors.error)
                    .setDescription('Please provide a valid id');
            }

            let channel = guild.channels.cache.get(chan.exec(args[0])[0]);

            if (!channel) {
                return embed.setTitle('Set voice log')
                    .setColor(bot.embedColors.error)
                    .setDescription('Please provide a valid id');
            }

            await channel.createWebhook('Hinata', {
                avatar: bot.user.avatarURL({
                    dynamic: true,
                    size: 4096
                })
            }).then(hook => {
                voiceLogChannel = hook.id;
            });

            embed.setTitle('Set voice log')
                .setColor(bot.embedColors.normal)
                .setDescription(`Voice log channel set to <#${channel.id}>`);
        }

        await ServerSettings.findOne({
            where: {
                serverId: guild.id
            }
        }).then(async server => {
            server.voiceLogChannel = voiceLogChannel;

            server.save();
        });

        await message.channel.send(embed);
    }
}