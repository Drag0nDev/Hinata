const config = require("../../../config.json")
const {MessageEmbed} = require('discord.js');
const log4js = require("log4js");
const {Permissions, Dates, Servers} = require('../../misc/tools');

const logger = log4js.getLogger();

module.exports = {
    name: 'fetchserver',
    aliases: ['fs', 'server', 'getserver'],
    category: 'owner',
    description: 'Fetch all info on a server including invite link.\n' +
        'Invite link is used when a server is used to inspect servers if they are behaving weirdly.',
    usage: '[command | alias] <server id>',
    ownerOnly: true,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('Fetch server');
        const fields = {
            fields: []
        };

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
        fields.fields.push({name: `Id`, value: `${guild.id}`, inline: true});

        //find the owner and all his/her info
        let owner = guild.members.cache.get(guild.ownerID);
        fields.fields.push({name: `Owner`, value: `${owner.user.username}#${owner.user.discriminator}`, inline: true});
        fields.fields.push({name: `Users`, value: `${guild.memberCount}`, inline: true});

        //find the amount of bots in the server
        let bots = Servers.getBots(guild);
        fields.fields.push({name: `Bots`, value: `${bots}`, inline: true});

        //get the date
        let date = Dates.getDate(guild.createdTimestamp);
        fields.fields.push({name: `Creation date`, value: `${date}`, inline: true});

        //check the amount of each channel sort
        let textCh = Servers.getChannelAmount(guild.channels.cache, 'text');
        let voiceCh = Servers.getChannelAmount(guild.channels.cache, 'voice');
        let categoryCh = Servers.getChannelAmount(guild.channels.cache, 'category');

        let channelString = `**Categories:** ${categoryCh}\n` +
            `**Text channels:** ${textCh}\n` +
            `**Voice channels:** ${voiceCh}`;
        fields.fields.push({name: `Channels`, value: `${channelString}`, inline: true});

        //look for the system channel
        let systemchannel = getSystemChannel(guild);
        fields.fields.push({name: `System channel`, value: `${systemchannel}`, inline: true});

        //look for AFK channel
        let afkChannel = getAfkChannel(guild);
        fields.fields.push({name: `AFK voice channel`, value: `${afkChannel}`, inline: true});

        fields.fields.push({name: `Region`, value: `${guild.region}`, inline: true});
        fields.fields.push({name: `Verification level`, value: `${guild.verificationLevel}`, inline: true});
        fields.fields.push({name: `Boost tier`, value: `${guild.premiumTier}`, inline: true});
        fields.fields.push({name: `Boosts`, value: `${guild.premiumSubscriptionCount}`, inline: true});

        //get an invite code and make the embed
        let invites;

        try {
            invites = await guild.fetchInvites();

            let invite = invites.first();
            if (!invite)
                await createNew(guild).then(inv => {
                    invite = inv;
                }).catch(error => {
                    logger.error(error);
                });

            fields.fields.push({
                name: 'Invite link',
                value: `[Goto ${guild.name}](https://discord.gg/${invite.code})`,
                inline: false
            });

            await message.channel.send(embed.setTitle(guild.name)
                .setThumbnail(guild.iconURL({
                    dynamic: true,
                    size: 4096
                }))
                .addFields(fields.fields)
                .setColor(bot.embedColors.normal));
        } catch (error) {
            await message.channel.send(embed.setTitle(guild.name)
                .setThumbnail(guild.iconURL({
                    dynamic: true,
                    size: 4096
                }))
                .addFields(fields.fields)
                .setColor(bot.embedColors.normal));
        }
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