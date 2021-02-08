const config = require("../../../config.json")
const {MessageEmbed} = require('discord.js');
const log4js = require("log4js");
const {Permissions, Dates} = require('../../misc/tools');

const logger = log4js.getLogger();

module.exports = {
    name: 'fetchserver',
    aliases: ['fs', 'server', 'getserver'],
    category: 'owner',
    description: 'Make the bot leave a guild',
    usage: '[command | alias] <server id>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('Fetch server');

        //check if the user is the bot owner
        if (message.author.id !== config.owner) {
            Permissions.ownerOnly(bot, message.channel)
            return;
        }

        //check if serverid is given
        if (!args[0])
            return message.channel.send(embed.setDescription(`No server id given`)
                .setColor(bot.embedColors.error));

        //see if bot is in the server
        if (!bot.guilds.cache.get(args[0]))
            return message.channel.send(embed.setDescription(`I am not in a server with id ${args[0]}`)
                .setColor(bot.embedColors.error));

        //assign guild
        const guild = bot.guilds.cache.get(args[0]);

        //find the owner and all his/her info
        let owner = guild.members.cache.get(guild.ownerID);

        //find the amount of bots in the server
        let bots = tools.getBots(guild);

        //check the amount of each channel sort
        let textCh = tools.getChannelAmount(guild.channels.cache, 'text');
        let voiceCh = tools.getChannelAmount(guild.channels.cache, 'voice');
        let categoryCh = tools.getChannelAmount(guild.channels.cache, 'category');

        let channelString = `**Categories:** ${categoryCh}\n` +
            `**Text channels:** ${textCh}\n` +
            `**Voice channels:** ${voiceCh}`;

        //look for the system channel
        let systemchannel = getSystemChannel(guild);

        //look for AFK channel
        let afkChannel = getAfkChannel(guild);

        //get the date
        let date = Dates.getDate(guild.createdTimestamp);

        //get an invite code and make the embed
        guild.fetchInvites().then(async invites => {
            try {
                let invite = invites.first();
                if (!invite)
                    await createNew(guild).then(inv => {
                        invite = inv;
                    }).catch(error => {
                        logger.error(error);
                    });

                await message.channel.send(embed.setTitle(guild.name)
                    .setThumbnail(guild.iconURL({
                        dynamic: true,
                        size: 4096
                    }))
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
            } catch (error) {
                logger.error(error)
            }
        });
    }
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

async function createNew(guild) {
    let channel = guild.channels.cache.find(channel => channel.type === 'text');

    return await channel.createInvite();
}