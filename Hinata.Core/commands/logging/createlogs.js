const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');
const neededPerm = ['MANAGE_CHANNELS', 'MANAGE_WEBHOOKS'];

module.exports = {
    name: 'createlogs',
    aliases: ['cl', 'alllogs'],
    category: 'logging',
    description: 'Create all logging channels in a single command.\n' +
        '||Modlog channel not included.||',
    usage: '[command | alias] <channelID>',
    examples: ['h!cl'],
    neededPermissions: neededPerm,
    run: async (bot, message) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal)
            .setTitle('Create logs');
        let user = message.author;
        let guild = message.guild;
        let joinleave;
        let member;
        let $server;
        let $message;
        let voice;

        let serverDb;
        serverDb = await ServerSettings.findOne({
            where: {
                serverId: guild.id
            }
        });

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
            joinleave = await createChannel(bot, message, guild, user, 'join-leave-log', category);
            member = await createChannel(bot, message, guild, user, 'member-log', category);
            $server = await createChannel(bot, message, guild, user, 'server-log', category);
            $message = await createChannel(bot, message, guild, user, 'message-log', category);
            voice = await createChannel(bot, message, guild, user, 'voice-log', category);

            embed.setDescription('All logging channels created.')
                .addField('join/leave log', `<#${joinleave.channelId}>`, true)
                .addField('member log', `<#${member.channelId}>`, true)
                .addField('server log', `<#${$server.channelId}>`, true)
                .addField('message log', `<#${$message.channelId}>`, true)
                .addField('voice log', `<#${voice.channelId}>`, true);

            serverDb.joinLeaveLogChannel = null;
            serverDb.memberLogChannel = null;
            serverDb.serverLogChannel = null;
            serverDb.messageLogChannel = null;
            serverDb.voiceLogChannel = null;

            serverDb.joinLeaveLogChannel = joinleave.hookId;
            serverDb.memberLogChannel = member.hookId;
            serverDb.serverLogChannel = $server.hookId;
            serverDb.messageLogChannel = $message.hookId;
            serverDb.voiceLogChannel = voice.hookId;

            serverDb.save();


            await message.channel.send(embed);
        });
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

    return await channel.createWebhook('Hinata', {
        avatar: bot.user.avatarURL({
            dynamic: true,
            size: 4096
        })
    }).then(hook => {
        return {hookId: hook.id,
            channelId: channel.id};
    });
}