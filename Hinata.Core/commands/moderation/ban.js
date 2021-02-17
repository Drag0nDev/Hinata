const {MessageEmbed} = require("discord.js");
const {ServerUser, Timers} = require('../../misc/dbObjects');
const {Permissions, Servers, Compare, Dates, Logs} = require('../../misc/tools');
const neededPerm = ['BAN_MEMBERS'];

module.exports = {
    name: 'ban',
    category: 'moderation',
    description: 'ban a member from the server',
    usage: '[command | alias] [Member mention/id] <reason>',
    examples: ['h!ban @Drag0n#6666', 'h!ban @Drag0n#6666 1h', 'h!ban @Drag0n#6666 1h being a bad boy', "h!ban @Drag0n#6666 Bad boys are not welcome"],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let checkTemp = new RegExp('^[0-9]*[smhd]');
        let reason = 'No reason provided';
        let embed = new MessageEmbed().setTimestamp().setColor(bot.embedColors.ban).setTitle('User banned');

        //check member and bot permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = Permissions.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        //check if there is an argument
        if (!args[0])
            return message.channel.send('Please provide a user to ban!');

        let member;

        member = await Servers.getMember(message, args);

        const author = message.guild.members.cache.get(message.author.id);

        //check if member is in the server
        if (!member) {
            return message.channel.send("No member found with this id/name!");
        }

        const canBan = Compare.compareRoles(author, member);

        //check if the author has a higher role then the member
        if (!canBan)
            return message.channel.send(`You can't ban **${member.user.tag}** due to role hierarchy!`);
        //check if member is banable
        if (!member.bannable) {
            return message.channel.send(`I can't ban **${member.user.tag}** due to role hierarchy!`);
        }

        //check if it is self ban, or bot ban
        if (member.user.id === message.author.id) {
            return message.channel.send("You can't ban yourself");
        }

        await args.shift();

        if (checkTemp.exec(args[0])) {
            let time = checkTemp.exec(args[0])[0];
            await args.shift();

            if (args[0]) {
                reason = args.join(' ');
            }

            if (reason.length > 1000){
                embed.setColor(bot.embedColors.error)
                    .setDescription('The reason is too long.\n' +
                        'Keep it under 1000 characters.')
                    .setTimestamp();

                return await message.channel.send(embed);
            }

            await tempBan(bot, message, member, embed, time, reason);
        } else {
            if (args[0]) {
                reason = args.join(' ');
            }

            if (reason.length > 1000){
                embed.setColor(bot.embedColors.error)
                    .setDescription('The reason is too long.\n' +
                        'Keep it under 1000 characters.')
                    .setTimestamp();

                return await message.channel.send(embed);
            }

            await ban(bot, message, member, embed, reason);
        }
    }
}

async function tempBan(bot, message, member, embed, time, reason) {
    let expiration = new Date();
    await Dates.calcExpiration(expiration, time);
    let timeVal = await Dates.getTimeval(time);
    let $time = await Dates.getTime(time);

    embed.setTitle('Ban')
        .setDescription(`**${member.user.tag}** is banned for **${$time} ${timeVal}** with reason: **${reason}**!`)
        .setColor(bot.embedColors.normal);

    await member.createDM().then(async dmChannel => {
        await dmChannel.send(`You got banned from **${message.guild.name}** for **${$time} ${timeVal}** with reason: **${reason}**!`);
    }).catch(error => {
        embed.addField('No DM sent', `${member.user.tag} was temporary banned but could not be DMed!`);
    });

    await message.channel.send(embed);

    await member.ban({
        days: 7,
        reason: `${reason}`
    });

    Timers.create({
        guildId: message.guild.id,
        userId: member.id,
        moderatorId: message.author.id,
        type: 'Ban',
        expiration: expiration.getTime()
    });

    const logEmbed = new MessageEmbed().setTitle('User temporary banned')
        .setColor(bot.embedColors.ban)
        .setDescription(`**Member:** ${member.user.tag}\n` +
            `**Duration:** ${$time} ${timeVal}\n` +
            `**Reason:** ${reason}\n` +
            `**Responsible Moderator:** ${message.author.tag}`)
        .setFooter(`ID: ${member.user.id}`)
        .setTimestamp();

    await Logs.modlog(message.guild.members.cache.get(message.author.id), logEmbed);
}

async function ban(bot, message, member, embed, reason) {
    embed.setTitle('Ban')
        .setDescription(`**${member.user.tag}** is banned for reason: **${reason}**.`)
        .setColor(bot.embedColors.normal);

    await member.createDM().then(async dmChannel => {
        await dmChannel.send(`You got banned from **${message.guild.name}** with reason: **${reason}**!`);
    }).catch(error => {
        embed.addField('No DM sent', `${member.user.tag} was banned but could not be DMed!`);
    });

    await message.channel.send(embed);

    await member.ban({
        days: 7,
        reason: `${reason}`
    });

    const logEmbed = new MessageEmbed().setTitle('User banned')
        .setColor(bot.embedColors.ban)
        .setDescription(`**Member:** ${member.user.tag}\n` +
            `**Reason:** ${reason}\n` +
            `**Responsible Moderator:** ${message.author.tag}`)
        .setFooter(`ID: ${member.user.id}`)
        .setTimestamp();

    await Logs.modlog(message.guild.members.cache.get(message.author.id), logEmbed);

    await ServerUser.destroy({
        where: {
            guildId: member.guild.id,
            userId: member.user.id
        }
    });
}