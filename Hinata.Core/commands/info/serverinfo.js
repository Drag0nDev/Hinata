const {MessageEmbed} = require('discord.js');
const {Servers, Dates} = require('../../misc/tools');

module.exports = {
    name: 'serverinfo',
    aliases: ['sinfo'],
    category: 'info',
    description: 'see info about the server',
    usage: '[command | alias]',
    examples: ['h!sinfo', 'h!sinfo 418037700751261708', 'h!sinfo @Drag0n#6666'],
    cooldown: 10,
    run: async (bot, message) => {
        const sinfo = {
            send: async (msg) => {
                message.channel.send(msg);
            },
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal),
            guild: message.guild,
            fields: [
                {
                    name: `Id`,
                    value: `${message.guild.id}`,
                    inline: true
                }
            ]
        }

        //find the owner and all his/her info
        sinfo.owner = sinfo.guild.members.cache.get(sinfo.guild.ownerID);
        sinfo.fields.push({
            name: 'Owner',
            value: `${sinfo.owner.user.username}#${sinfo.owner.user.discriminator}`,
            inline: true
        });

        sinfo.fields.push({
            name: `Users`,
            value: `${sinfo.guild.memberCount}`,
            inline: true
        });

        //find the amount of bots in the server
        sinfo.fields.push({
            name: 'Bots',
            value: Servers.getBots(sinfo.guild),
            inline: true
        });

        //get the date
        sinfo.fields.push({
            name: 'Creation date',
            value: Dates.getDate(sinfo.guild.createdTimestamp),
            inline: true
        });

        //check the amount of each channel sort
        sinfo.fields.push({
            name: 'Channels',
            value: `**Categories:** ${Servers.getChannelAmount(sinfo.guild.channels.cache, 'category')}\n` +
                `**Text channels:** ${Servers.getChannelAmount(sinfo.guild.channels.cache, 'text')}\n` +
                `**Voice channels:** ${Servers.getChannelAmount(sinfo.guild.channels.cache, 'voice')}`,
            inline: true
        });

        //look for the system channel
        sinfo.fields.push({
            name: 'System channel',
            value: getSystemChannel(sinfo.guild),
            inline: true
        });

        //look for AFK channel
        sinfo.fields.push({
            name: 'AFK voice channel',
            value: getAfkChannel(sinfo.guild),
            inline: true
        });

        //get other fields like server region and verification
        sinfo.fields.push(
            {
                name: 'Region',
                value: sinfo.guild.region,
                inline: true
            },
            {
                name: 'Verification level',
                value: sinfo.guild.verificationLevel,
                inline: true
            },
            {
                name: 'Boost tier',
                value: sinfo.guild.premiumTier.toString(),
                inline: true
            },
            {
                name: 'Boosts',
                value: sinfo.guild.premiumSubscriptionCount.toString(),
                inline: true
            }
        )

        sinfo.embed.setTitle(sinfo.guild.name)
            .setThumbnail(sinfo.guild.iconURL({
                dynamic: true,
                size: 4096
            }))
            .addFields(sinfo.fields);

        await sinfo.send(sinfo.embed);
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