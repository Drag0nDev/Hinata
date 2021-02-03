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
        let embed = new MessageEmbed().setColor(bot.embedColors.normal)
            .setTitle('Create logs');
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
                let joinleave = await createChannel(bot, message, guild, user, 'join-leave-log', category);
                let member = await createChannel(bot, message, guild, user, 'member-log', category);
                let $server = await createChannel(bot, message, guild, user, 'server-log', category);
                let $message = await createChannel(bot, message, guild, user, 'message-log', category);
                let voice = await createChannel(bot, message, guild, user, 'voice-log', category);

                server.joinLeaveLogChannel = joinleave.hookId;
                server.memberLogChannel = member.hookId;
                server.serverLogChannel = $server.hookId;
                server.messageLogChannel = $message.hookId;
                server.voiceLogChannel = voice.hookId;

                embed.setDescription('All logging channels created.')
                    .addField('join/leave log', `<#${joinleave.channelId}>`, true)
                    .addField('member log', `<#${member.channelId}>`, true)
                    .addField('server log', `<#${$server.channelId}>`, true)
                    .addField('message log', `<#${$message.channelId}>`, true)
                    .addField('voice log', `<#${voice.channelId}>`, true);
            });

            server.save();
        });

        await message.channel.send(embed);
    }
}

async function createChannel(bot, message, guild, user, channelName, parent) {
    let channel;

    await guild.channels.create(channelName, {
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
    }).then(newChannel => {
        channel = newChannel;
    });

    return channel.createWebhook('Stella', {
        avatar: bot.user.avatarURL({
            dynamic: true,
            size: 4096
        })
    }).then(hook => {
        return {hookId: hook.id,
            channelId: channel.id};
    });
}