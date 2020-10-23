const config = require("../../../config.json")
const {MessageEmbed} = require('discord.js');
const log4js = require("log4js");

const logger = log4js.getLogger();

module.exports = {
    name: 'fetchserver',
    aliases: ['fs', 'server', 'getserver'],
    category: 'owner',
    description: 'Make the bot leave a guild',
    usage: '[command | alias] <server id>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('Fetch server');

        //<editor-fold defaultstate="collapsed" desc="Preparations">
        //check if the user is the bot owner
        if (!(message.member.id === config.OWNER))
            return message.channel.send(embed.setDescription(`${message.author} this is a command only for my creator!`)
                .setColor(bot.embedColors.error));

        //check if serverid is given
        if (!args[0])
            return message.channel.send(embed.setDescription(`No server id given`)
                .setColor(bot.embedColors.error));

        //see if bot is in the server
        if (!bot.guilds.cache.get(args[0]))
            return message.channel.send(embed.setDescription(`I am not in a server with id ${args[0]}`)
                .setColor(bot.embedColors.error));
        //</editor-fold>

        //assign guild
        const guild = bot.guilds.cache.get(args[0]);

        //<editor-fold defaultstate="collapsed" desc="all guild stats variables">
        //find the owner and all his/her info
        let owner = guild.members.cache.get(guild.ownerID);

        //find the amount of bots in the server
        let bots = getBots(guild);

        //check the amount of each channel sort
        let textCh = getChannelAmount(guild.channels.cache, 'text');
        let voiceCh = getChannelAmount(guild.channels.cache, 'voice');
        let categoryCh = getChannelAmount(guild.channels.cache, 'category');

        let channelString = `**Categories:** ${categoryCh}\n` +
            `**Text channels:** ${textCh}\n` +
            `**Voice channels:** ${voiceCh}`;

        //look for the system channel
        let systemchannel = getSystemChannel(guild);

        //look for AFK channel
        let afkChannel = getAfkChannel(guild);

        //get the date
        let date = getDate(guild.createdTimestamp);
        //</editor-fold>

        //get an invite code and make the embed
        guild.fetchInvites().then(invites => {
            let invite = invites.first();
            message.channel.send(embed.setTitle(guild.name)
                .setThumbnail(guild.iconURL())
                .addFields(
                    {name: `Id`, value: `${guild.id}`, inline: true},
                    {name: `Owner`, value: `${owner.user.username}#${owner.user.discriminator}`, inline: true},
                    {name: `Users`, value: `${guild.memberCount}`, inline: true},
                    {name: `Bots`, value: `${bots}`, inline: true},
                    {name: `Creation date`, value: `${date}`, inline: true},
                    {name: `Channels`, value: `${channelString}`, inline: true},
                    {name: `System channel`, value: `${systemchannel}`, inline: true},
                    {name: `AFK voice channel`, value: `${afkChannel}`, inline: true},
                    {name: `Region`, value: `${guild.region}`, inline: true},
                    {name: `Verification level`, value: `${guild.verificationLevel}`, inline: true},
                    {name: `Boost tier`, value: `${guild.premiumTier}`, inline: true},
                    {name: `Boosts`, value: `${guild.premiumSubscriptionCount}`, inline: true},
                    {name: 'Invite link', value: `[Goto ${guild.name}](https://discord.gg/${invite.code})`, inline: false},
                )
                .setColor(bot.embedColors.normal))
        });
    }
}

// <editor-fold defaultstate="collapsed" desc="used functions">
function getBots(guild) {
    let amount = 0;

    guild.members.cache.forEach(member => {
        if (member.user.bot) amount++;
    });

    return amount;
}

function getChannelAmount(channels, sort) {
    let amount = 0;

    channels.forEach(channel => {
        if (channel.type === sort) amount++;
    });

    return amount;
}

function getSystemChannel(guild) {

    //check for null on guld.systemChannel
    if (!guild.systemChannel) return `-`;

    let systemchannel = guild.channels.cache.get(guild.systemChannelID);

    return systemchannel.name;
}

function getAfkChannel(guild) {

    //check for null on guld.systemChannel
    if (!guild.afkChannelID) return `-`;

    let afkChannel = guild.channels.cache.get(guild.afkChannelID);

    return afkChannel.name;
}

function getDate(timestamp) {
    let date = new Date(timestamp);

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    let time = hours + ':' + minutes + ':' + seconds + ' ' + ampm;

    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getUTCDate()}\n${time}`
}
//</editor-fold>