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
        const cl = {
            send: async (msg) => {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal)
                .setTitle('Create logs'),
            user: message.author,
            guild: message.guild,
            channel:{}
        }

        cl.serverDb = await ServerSettings.findOne({
            where: {
                serverId: cl.guild.id
            }
        });

        await cl.guild.channels.create('logs', {
            type: "category",
            permissionOverwrites: [
                {
                    id: cl.user.id,
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
            cl.channel.joinleave = await createChannel(bot, message, cl, 'join-leave-log', category);
            cl.channel.member = await createChannel(bot, message, cl, 'member-log', category);
            cl.channel.server = await createChannel(bot, message, cl, 'server-log', category);
            cl.channel.message = await createChannel(bot, message, cl, 'message-log', category);
            cl.channel.voice = await createChannel(bot, message, cl, 'voice-log', category);

            cl.embed.setDescription('All logging channels created.')
                .addField('join/leave log', `<#${cl.channel.joinleave.channelId}>`, true)
                .addField('member log', `<#${cl.channel.member.channelId}>`, true)
                .addField('server log', `<#${cl.channel.server.channelId}>`, true)
                .addField('message log', `<#${cl.channel.message.channelId}>`, true)
                .addField('voice log', `<#${cl.channel.voice.channelId}>`, true);

            cl.serverDb.joinLeaveLogChannel = null;
            cl.serverDb.memberLogChannel = null;
            cl.serverDb.serverLogChannel = null;
            cl.serverDb.messageLogChannel = null;
            cl.serverDb.voiceLogChannel = null;

            cl.serverDb.joinLeaveLogChannel = cl.channel.joinleave.hookId;
            cl.serverDb.memberLogChannel = cl.channel.member.hookId;
            cl.serverDb.serverLogChannel = cl.channel.server.hookId;
            cl.serverDb.messageLogChannel = cl.channel.message.hookId;
            cl.serverDb.voiceLogChannel = cl.channel.voice.hookId;

            cl.serverDb.save();


            await cl.send(cl.embed);
        });
    }
}

async function createChannel(bot, message, cl, channelName, parent) {
    let channel;

    channel = await cl.guild.channels.create(channelName, {
        type: "text",
        parent: parent,
        permissionOverwrites: [
            {
                id: cl.user.id,
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

    return await channel.createWebhook('Hinata', {
        avatar: bot.user.avatarURL({
            dynamic: true,
            size: 4096
        })
    }).then(hook => {
        return {
            hookId: hook.id,
            channelId: channel.id
        };
    });
}