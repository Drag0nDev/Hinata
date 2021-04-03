const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Logs} = require("../misc/tools");

module.exports = async (bot, oldState, newState) => {
    try {
        if (!newState.guild.me.hasPermission("MANAGE_WEBHOOKS")) return;

        const member = newState.guild.members.cache.get(newState.id);

        let embed = new MessageEmbed().setTimestamp()
            .setAuthor(`${member.user.username}#${member.user.discriminator}`,
                member.user.avatarURL({dynamic: true}),
                member.user.avatarURL({dynamic: true, size: 4096}))
            .setFooter(`ID: ${newState.id}`);

        if (oldState.channelID !== newState.channelID && oldState.channelID === null)
            await joinChannel(bot, oldState, newState, member, embed);
        else if (oldState.channelID !== newState.channelID && newState.channelID === null)
            await leaveChannel(bot, oldState, newState, member, embed);
        else if (oldState.channelID !== newState.channelID)
            await switchChannel(bot, oldState, newState, member, embed);
        else
            return;

        await Logs.voiceLogChannel(bot, newState.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}

async function joinChannel(bot, oldState, newState, member, embed) {
    const channel = await newState.guild.channels.cache.get(newState.channelID);

    if (channel)
        embed.setTitle('Member joined voice channel')
            .setColor(bot.embedColors.logs.logAdd)
            .setDescription(`**${member.user.username}#${member.user.discriminator}** joined #${channel.name}`);
}

async function leaveChannel(bot, oldState, newState, member, embed) {
    const channel = await newState.guild.channels.cache.get(oldState.channelID);

    if (channel)
        embed.setTitle('Member left voice channel')
            .setColor(bot.embedColors.logs.logRemove)
            .setDescription(`**${member.user.username}#${member.user.discriminator}** left #${channel.name}`);
}

async function switchChannel(bot, oldState, newState, member, embed) {
    let oldChannel, newChannel;
    oldChannel = await newState.guild.channels.cache.get(oldState.channelID);
    newChannel = await newState.guild.channels.cache.get(newState.channelID);

    if (oldChannel && newChannel)
        embed.setTitle('Member switched voice channel')
            .setColor(bot.embedColors.logs.logChange)
            .setDescription(`**${member.user.username}#${member.user.discriminator}** switched channel`)
            .addField('Before', oldChannel.name, true)
            .addField('After', newChannel.name, true);
}