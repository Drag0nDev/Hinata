const {User, ServerUser, Server, ServerSettings} = require('./dbObjects');
const {MessageEmbed} = require('discord.js');
const logger = require("log4js").getLogger();

module.exports = {
    //guild checks
    getMember: async function (message, args) {
        return !args[0] ? message.guild.members.cache.get(message.author.id) : message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    },
    getUser: async function (bot, message, args){
        return message.mentions.members.first() || bot.users.cache.get(args[0]);
    },
    getGuild: async function (message) {
        return message.guild;
    },
    getBots: function (guild) {
        let amount = 0;

        guild.members.cache.forEach(member => {
            if (member.user.bot) amount++;
        });

        return amount;
    },
    getChannelAmount: function (channels, sort) {
        let amount = 0;

        channels.forEach(channel => {
            if (channel.type === sort) amount++;
        });

        return amount;
    },
    getRole: async function (message, args){
        return !args[0] ? message.guild.roles.cache.get(message.author.id) : message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    },

    //conversions and comparisons
    compareRoles: function (author, member) {
        let roleArrayAuth = [];
        let roleArrayMemb = [];

        //get all the roles and their objects in an array
        author._roles.forEach(roleId => {
            roleArrayAuth.push(member.guild.roles.cache.get(roleId));
        });

        member._roles.forEach(roleId => {
            roleArrayMemb.push(member.guild.roles.cache.get(roleId));
        });

        roleArrayAuth.sort((a, b) => b.position - a.position);
        roleArrayMemb.sort((a, b) => b.position - a.position);

        if (!roleArrayMemb[0] && roleArrayAuth[0]){
            return true;
        } else if (!roleArrayAuth[0] && roleArrayMemb[0]){
            return false;
        } else {
            return roleArrayAuth[0].position >= roleArrayMemb[0].position;
        }
    },
    getDate: function (timestamp) {
        let date = new Date(timestamp);

        let months = date.getMonth() + 1;
        let days = date.getUTCDate();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let ampm = hours >= 12 ? 'PM' : 'AM';

        months = months < 10 ? '0' + months : months;
        days = days < 10 ? '0' + days : days;
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        let time = hours + ':' + minutes + ':' + seconds + ' ' + ampm;

        return `${date.getFullYear()}/${months}/${days}\n${time}`;
    },

    //bot test message
    testing: async function (bot, message) {
        let embed = new MessageEmbed().setTitle('Currently out of order!')
            .setColor(bot.embedColors.error)
            .setFooter('Try again later')
            .setDescription('**__I am sorry but currently I am either one of both:__**\n' +
                '**1.** I am locked down because a major bug has appeared that could lead to unwanted behaviour.\n' +
                '**2.** I am under maintenance.\n\n' +
                'I hope you can understand this.\n' +
                'If you want to know when I am back to normal, then join my [support server!](https://discord.gg/ReBJ4AB)')
            .setTimestamp()
            .setThumbnail(bot.user.avatarURL());

        await message.channel.send(embed);
    },

    //permission checks
    ownerOnly: function (bot, channel) {
        let embed = new MessageEmbed().setColor(bot.embedColors.error)
            .setDescription('This command is only for the owner of the bot');

        channel.send(embed);
    },
    checkUserPermissions: function (bot, message, neededPermissions, embed) {
        for (let i = 0; i < neededPermissions.length; i++) {
            let neededPerm = neededPermissions[i];

            if (!message.member.hasPermission(neededPerm)) {
                return embed.setColor(bot.embedColors.error)
                    .setDescription(`You don't have the required permission to run this command\n` +
                        `**Missing requirements:** ${neededPerm}`);
            }
        }
    },
    checkBotPermissions: function (bot, message, neededPermissions, embed) {
        for (let i = 0; i < neededPermissions.length; i++) {
            let neededPerm = neededPermissions[i];

            if (!message.guild.me.hasPermission(neededPerm)) {
                return embed.setColor(bot.embedColors.error)
                    .setDescription(`I don't have the required permission to run this command\n` +
                        `**Missing requirements:** ${neededPerm}`);
            }
        }
    },

    //database functions
    dbAdd: async function (member, server) {
        await ServerUser.findOrCreate({
            where: {
                userId: member[1].user.id,
                guildId: member[1].guild.id
            }
        });
        await User.findOrCreate({
            where: {
                userId: member[1].user.id
            },
            defaults: {
                userTag: `${member[1].user.username}#${member[1].user.discriminator}`
            }
        });
        await Server.findOrCreate({
            where: {
                serverId: server.id
            },
            defaults: {
                serverName: server.name
            }
        });
        await ServerSettings.findOrCreate({
            where: {
                serverId: server.id
            }
        });
    },

    //moderation
    calcExpiration: async function (date, time) {
        let getVal = new RegExp('[smhd]');
        let getTime = new RegExp('[0-9]*');

        let timeVal = getVal.exec(time)[0];
        let $time = getTime.exec(time)[0];

        switch (timeVal) {
            case 's':
                date.setSeconds(date.getSeconds() + parseInt($time));
                break;
            case 'm':
                date.setMinutes(date.getMinutes() + parseInt($time));
                break;
            case 'h':
                date.setHours(date.getHours() + parseInt($time));
                break;
            case 'd':
                date.setDate(date.getDate() + parseInt($time));
                break;
        }
    },
    getTimeval: async function (time) {
        let getVal = new RegExp('[smhd]');

        let timeVal = getVal.exec(time)[0];
        let timeperiod;

        switch (timeVal) {
            case 's':
                timeperiod = 'seconds';
                break;
            case 'm':
                timeperiod = 'minutes';
                break;
            case 'h':
                timeperiod = 'hours';
                break;
            case 'd':
                timeperiod = 'days';
                break;
        }

        return timeperiod;
    },
    getTime: async function (time) {
        let getTime = new RegExp('[0-9]*');

        return getTime.exec(time)[0];
    },


    //post logs
    modlog: async function (member, embed) {
        const modlogChannel = member.guild.channels.cache.get(await getModlogChannel(member.guild.id));

        if (modlogChannel)
            await modlogChannel.send(embed);
    },

    //message reactions
    addPageArrows: async function (message) {
        await message.react('◀');
        await message.react('▶');
    },

    //reaction commands
    getMembers: async function (message, args, userMentions, regex) {
        let checkId = new RegExp('[0-9]+');
        let members = '';

        args.forEach(arg => {
            if (checkId.exec(arg) !== null) {
                if (message.guild.members.cache.get(checkId.exec(arg)[0])) {
                    userMentions.push(checkId.exec(arg)[0]);
                    members += `<@!${checkId.exec(arg)[0]}> `;
                } else if (message.guild.roles.cache.get(checkId.exec(arg)[0])) {
                    members += `<@&${checkId.exec(arg)[0]}> `;
                }
            }
        });

        return members;
    },

    //member changes
    giveRole: async function (member, role) {
        await member.roles.add(role);
    },
    removeRole: async function (member, role) {
        await member.roles.remove(role);
    }
}

//private functions
async function getModlogChannel(serverId) {
    return ServerSettings.findOne({
        where: {
            serverId: serverId
        }
    }).then(server => {
        return server.modlogChannel;
    }).catch(err => {
        logger.error(err);
    });
}