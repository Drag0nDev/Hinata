const tools = require("../../misc/tools");
const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');
const neededPerm = ['MANAGE_CHANNELS'];

module.exports = {
    name: 'createlogs',
    aliases: ['cl', 'alllogs'],
    category: 'logging',
    description: 'Create all logging channels in a single command.\n' +
        '||Modlog channel not included.||',
    usage: '[command | alias] <channelID>',
    examples: ['s!cl'],
    neededPermissions: neededPerm,
    run: async (bot, message) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
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
            await guild.channels.create('logs', {
                type: "category",
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
            }).then(async category => {
                server.joinLeaveLogChannel = await createChannel(bot, message, guild, user, 'join-leave-log', category);
                server.memberLogChannel = await createChannel(bot, message, guild, user, 'member-log', category);
                server.serverLogChannel = await createChannel(bot, message, guild, user, 'server-log', category);
                server.messageLogChannel = await createChannel(bot, message, guild, user, 'message-log', category);
                server.voiceLogChannel = await createChannel(bot, message, guild, user, 'voice-log', category);
            });

            server.save();
        });

        await message.channel.send(embed);
    }
}

async function createChannel(bot, message, guild, user, channelName, parent) {
    return await guild.channels.create(channelName, {
        type: "text",
        parent: parent,
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
        return channel.id;
    });
}