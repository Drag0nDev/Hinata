const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Logs} = require("../misc/tools");

module.exports = async (bot, oldState, newState) => {
    try {
        if (newState.guild.me.hasPermission("MANAGE_WEBHOOKS")) return;

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
        else 
            await switchChannel(bot, oldState, newState, member, embed);

        await Logs.voiceLogChannel(bot, newState.guild, embed);
    } catch (err) {
        logger.error(err);
    }
}

async function joinChannel(bot, oldState, newState, member, embed) {
    const channel = await newState.guild.channels.cache.get(newState.channelID);

    embed.setTitle('Member joined voice channel')
        .setColor(bot.embedColors.logAdd)
        .setDescription(`**${member.user.username}#${member.user.discriminator}** joined #${channel.name}`);
}

async function leaveChannel(bot, oldState, newState, member, embed) {
    const channel = await newState.guild.channels.cache.get(oldState.channelID);

    embed.setTitle('Member left voice channel')
        .setColor(bot.embedColors.logRemove)
        .setDescription(`**${member.user.username}#${member.user.discriminator}** left #${channel.name}`);
}

async function switchChannel(bot, oldState, newState, member, embed) {
    const oldChannel = await newState.guild.channels.cache.get(oldState.channelID);
    const newChannel = await newState.guild.channels.cache.get(newState.channelID);

    embed.setTitle('Member switched voice channel')
        .setColor(bot.embedColors.logChange)
        .setDescription(`**${member.user.username}#${member.user.discriminator}** switched channel`)
        .addField('Before', oldChannel.name, true)
        .addField('After', newChannel.name, true);
}