const {MessageEmbed} = require("discord.js");
const {Timers, ServerSettings} = require('../../misc/dbObjects');
const {Permissions, Compare, Servers, Dates, Roles, Logs} = require('../../misc/tools');
const neededPerm = ['MANAGE_ROLES', "MUTE_MEMBERS"];

module.exports = {
    name: 'mute',
    category: 'moderation',
    description: 'Mute a member from the server for a set time',
    usage: '[command | alias] [Member mention/id] <time (d, h, m, s)> <reason>',
    examples: ['h!mute @Drag0n#6666', 'h!mute @Drag0n#6666 1h', 'h!mute @Drag0n#6666 1h being a bad boy'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let checkTemp = new RegExp('^[0-9]*[smhd]');
        let reason = 'No reason provided';
        let muteRole;
        let embed = new MessageEmbed().setTitle('Mute');
        let guild = message.guild;
        let muteRoleId;

        //check member and bot permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = Permissions.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        //check if there is an argument
        if (!args[0])
            return message.channel.send(embed.setDescription('No user found with this id/name')
                .setColor(bot.embedColors.error));

        let member;

        await Servers.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        //check if member is in the server
        if (!member) {
            return message.channel.send("No member found with this id/name!");
        }

        if (!Compare.compareRoles(message.guild.members.cache.get(message.author.id), member)) {
            return message.channel.send(embed.setTitle('Action not allowed!')
                .setColor(bot.embedColors.error)
                .setDescription(`You can't mute **${member.user.tag}** due to role hierarchy!`));
        }

        await ServerSettings.findOne({
            where: {
                serverId: message.guild.id
            }
        }).then(server => {
            muteRoleId = server.muteRoleId;
        });

        if (!muteRoleId) {
            embed.setDescription('Please provide a valid muterole for this command to work')
                .setColor(bot.embedColors.error);
            return message.channel.send(embed);
        }

        muteRole = guild.roles.cache.get(muteRoleId);

        if(!muteRole) {
            embed.setDescription('Please provide a valid muterole for this command to work')
                .setColor(bot.embedColors.error);
            return message.channel.send(embed);
        }

        //check if assigned role is higher then bots highest role
        let roleCheck = Permissions.checkRolePosition(bot, message, muteRole);
        if (roleCheck)
            return await message.channel.send(embed);

        await args.shift();

        if (checkTemp.exec(args[0])) {
            let time = checkTemp.exec(args[0])[0];
            await args.shift();

            if (args[0])
                reason = args.join(' ');

            if (reason.length > 1000){
                embed.setColor(bot.embedColors.error)
                    .setDescription('The reason is too long.\n' +
                        'Keep it under 1000 characters.')
                    .setTimestamp();

                return await message.channel.send(embed);
            }

            await tempmute(bot, message, member, embed, muteRole, time, reason);
        } else {
            if (args[0])
                reason = args.join(' ');

            if (reason.length > 1000){
                embed.setColor(bot.embedColors.error)
                    .setDescription('The reason is too long.\n' +
                        'Keep it under 1000 characters.')
                    .setTimestamp();

                return await message.channel.send(embed);
            }

            await mute(bot, message, member, embed, muteRole, reason);
        }
    }
}

async function tempmute(bot, message, member, embed, muteRole, time, reason) {
    let expiration = new Date();
    await Dates.calcExpiration(expiration, time);
    let timeVal = await Dates.getTimeval(time);
    let $time = await Dates.getTime(time);

    await Roles.giveRole(member, muteRole);

    embed.setDescription(`**${member.user.tag}** is muted for **${$time} ${timeVal}** for reason: **${reason}**.`)
        .setColor(bot.embedColors.normal);

    await member.createDM()
        .then(async dmChannel => {
            await dmChannel.send(`You got muted in **${message.guild.name}** for **${$time} ${timeVal}** with reason: **${reason}**!`);
        }).catch(error => {
            embed.addField('No DM sent', `${member.user.tag} was muted but could not be DMed!`);
        });

    await message.channel.send(embed);

    Timers.create({
        guildId: message.guild.id,
        userId: member.id,
        moderatorId: message.author.id,
        type: 'Mute',
        expiration: expiration.getTime(),
        reason: reason
    });

    const logEmbed = new MessageEmbed().setTitle('User muted')
        .setColor(bot.embedColors.mute)
        .setDescription(`**Member:** ${member.user.tag}\n` +
            `**Duration:** ${$time} ${timeVal}\n` +
            `**Reason:** ${reason}\n` +
            `**Responsible Moderator:** ${message.author.tag}`)
        .setFooter(`ID: ${member.user.id}`)
        .setTimestamp();

    await Logs.modlog(member, logEmbed);
}

async function mute(bot, message, member, embed, muteRole, reason) {
    await member.createDM()
        .then(async dmChannel => {
            await dmChannel.send(`You got muted in **${message.guild.name}** with reason: **${reason}**!`);
        });

    await Roles.giveRole(member, muteRole);

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

    await Logs.modlog(member, logEmbed);
}