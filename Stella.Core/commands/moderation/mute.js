const {MessageEmbed} = require("discord.js");
const {Timers, Server} = require('../../misc/dbObjects');
const tools = require('../../misc/tools');
const neededPerm = ['MANAGE_ROLES', "MUTE_MEMBERS"];

module.exports = {
    name: 'mute',
    category: 'moderation',
    description: 'Mute a member from the server for a set time',
    usage: '[command | alias] [Member mention/id] <time (h, m, s)> <reason>',
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let checkTemp = new RegExp('^[0-9]*[smhd]');
        let reason = 'No reason provided';
        let muteRole;
        let embed = new MessageEmbed();
        let guild = message.guild;
        let muteRoleId;

        //check member and bot permissions
        let noUserPermission = tools.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = tools.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        //check if there is an argument
        if (!args[0])
            return message.channel.send('Please provide a user to mute!');

        let member;

        await tools.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        //check if member is in the server
        if (!member) {
            return message.channel.send("No member found with this id/name!");
        }

        if (!tools.compareRoles(message.guild.members.cache.get(message.author.id), member)) {
            return message.channel.send(embed = new MessageEmbed().setTitle('Currently out of order!')
                .setColor(bot.embedColors.error)
                .setDescription(`You can't mute **${member.user.tag}** due to role hierarchy!`));
        }

        await Server.findOne({
            where: {
                serverId: message.guild.id
            }
        }).then(server => {
            muteRoleId = server.muteRoleId;
        });

        if (muteRoleId === null) {
            embed.setDescription('Please provide a mute role for this command to work')
                .setColor(bot.embedColors.error);
            return message.channel.send(embed);
        }
        muteRole = guild.roles.cache.get(muteRoleId);

        await args.shift();

        if (checkTemp.exec(args[0])) {
            let time = checkTemp.exec(args[0]);
            await args.shift;

            if (!args[0]) {
                reason = args.join(' ')
            }

            await tempmute(bot, message, member, embed, muteRole, time, reason);
        } else {
            await mute()
        }
    }
}

async function tempmute(bot, message, member, embed, muteRole, time, reason) {
    let getVal = new RegExp('[smhd]');
    let getTime = new RegExp('[0-9]*');
    let expiration = new Date();

    let timeVal = getVal.exec(time)[0];
    let $time = getTime.exec(time)[0];
    let timeperiod;

    switch (timeVal) {
        case 's':
            expiration.setSeconds(expiration.getSeconds() + parseInt($time));
            timeperiod = 'seconds';
            break;
        case 'm':
            expiration.setMinutes(expiration.getMinutes() + parseInt($time));
            timeperiod = 'minutes';
            break;
        case 'h':
            expiration.setHours(expiration.getHours() + parseInt($time));
            timeperiod = 'hours';
            break;
        case 'd':
            expiration.setDate(expiration.getDate() + parseInt($time));
            timeperiod = 'days';
            break;
    }

    await addMuterole(member, muteRole);

    await member.createDM()
        .then(async dmChannel => {
            await dmChannel.send(`You got muted in **${message.guild.name}** for **${$time} ${timeperiod}** with reason: **${reason}**!`);
        });

    embed.setTitle('Mute')
        .setDescription(`**${member.user.tag}** is muted for **${$time} ${timeperiod}** for reason: **${reason}**.`)
        .setColor(bot.embedColors.normal);

    await message.channel.send(embed);

    Timers.create({
        guildId: message.guild.id,
        userId: member.id,
        moderatorId: message.author.id,
        type: 'Mute',
        expiration: expiration.getTime()
    });

    const logEmbed = new MessageEmbed().setTitle('User muted')
        .setColor(bot.embedColors.mute)
        .setDescription(`**Member:** ${member.user.tag}\n` +
            `**Duration:** ${$time} ${timeperiod}\n` +
            `**Reason:** ${reason}\n` +
            `**Responsible Moderator:** ${message.author.tag}`)
        .setFooter(`ID: ${member.user.id}`)
        .setTimestamp();

    await tools.modlog(member, logEmbed);
}

async function mute(bot, message, member, embed, muteRole, reason) {
    await member.createDM()
        .then(async dmChannel => {
            await dmChannel.send(`You got muted in **${message.guild.name}** with reason: **${reason}**!`);
        });

    embed.setTitle('Mute')
        .setDescription(`**${member.user.tag}** is muted for reason: **${reason}**.`)
        .setColor(bot.embedColors.normal);

    await message.channel.send(embed);

    const logEmbed = new MessageEmbed().setTitle('User muted')
        .setColor(bot.embedColors.mute)
        .setDescription(`**Member:** ${member.user.tag}\n` +
            `**Reason:** ${reason}\n` +
            `**Responsible Moderator:** ${message.author.tag}`)
        .setFooter(`ID: ${member.user.id}`)
        .setTimestamp();

    await tools.modlog(member, logEmbed);
}

async function addMuterole(member, muteRole) {
    await member.roles.add(muteRole);
}