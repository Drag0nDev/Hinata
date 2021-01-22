const {MessageEmbed} = require("discord.js");
const {Timers, ServerSettings} = require('../../misc/dbObjects');
const tools = require('../../misc/tools');
const neededPerm = ['MANAGE_ROLES', "MUTE_MEMBERS"];

module.exports = {
    name: 'mute',
    category: 'moderation',
    description: 'Mute a member from the server for a set time',
    usage: '[command | alias] [Member mention/id] <time (d, h, m, s)> <reason>',
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let checkTemp = new RegExp('^[0-9]*[smhd]');
        let reason = 'No reason provided';
        let muteRole;
        let embed = new MessageEmbed().setTitle('Mute');
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

        if (muteRoleId === null) {
            embed.setDescription('Please provide a mute role for this command to work')
                .setColor(bot.embedColors.error);
            return message.channel.send(embed);
        }

        muteRole = guild.roles.cache.get(muteRoleId);

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
    await tools.calcExpiration(expiration, time);
    let timeVal = await tools.getTimeval(time);
    let $time = await tools.getTime(time);

    await tools.giveRole(member, muteRole);

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
        expiration: expiration.getTime()
    });

    const logEmbed = new MessageEmbed().setTitle('User muted')
        .setColor(bot.embedColors.mute)
        .setDescription(`**Member:** ${member.user.tag}\n` +
            `**Duration:** ${$time} ${timeVal}\n` +
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

    await tools.giveRole(member, muteRole);

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