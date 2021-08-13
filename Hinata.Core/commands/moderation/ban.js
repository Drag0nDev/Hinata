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
        const $ban = {
            send: async (msg) => {
                await message.channel.send(msg);
            },
            checkTemp: new RegExp('^[0-9]+[smhd]'),
            reason: 'No reason provided',
            embed: new MessageEmbed().setTimestamp().setColor(bot.embedColors.moderations.ban),
        }

        //check if there is an argument
        if (!args[0])
            return $ban.send($ban.embed
                .setColor(bot.embedColors.embeds.error)
                .setDescription('Please provide a user to ban!'));

        $ban.member = await Servers.getMember(message, args);

        const author = message.guild.members.cache.get(message.author.id);

        //check if member is in the server
        if (!$ban.member)
            return $ban.send($ban.embed
                .setColor(bot.embedColors.embeds.error)
                .setDescription(`No member found with this id or name`));


        const canBan = Compare.compareRoles(author, $ban.member);

        //check if the author has a higher role then the member
        if (!canBan)
            return message.channel.send(embed.setTitle('Action not allowed!')
                .setColor(bot.embedColors.embeds.error)
                .setDescription(`You can't ban **${$ban.member.user.tag}** due to role hierarchy!`));
        //check if member is banable
        if (!$ban.member.bannable) {
            return message.channel.send(embed.setTitle('Action not allowed!')
                .setColor(bot.embedColors.embeds.error)
                .setDescription(`I can't ban **${$ban.member.user.tag}** due to role hierarchy!`));
        }

        //check if it is self ban, or bot ban
        if ($ban.member.user.id === message.author.id)
            return $ban.send($ban.embed.setTitle('Action not allowed!')
                .setColor(bot.embedColors.embeds.error)
                .setDescription(`You can't ban yourself!`));


        await args.shift();

        if ($ban.checkTemp.exec(args[0])) {
            $ban.time = $ban.checkTemp.exec(args[0])[0];
            await args.shift();

            if (args[0]) {
                $ban.reason = args.join(' ');
            }

            await tempBan(bot, message, $ban);
        } else {
            if (args[0]) {
                $ban.reason = args.join(' ');
            }

            await ban(bot, message, $ban);
        }
    }
}

async function tempBan(bot, message, ban) {
    const tempban = {
        expiration: new Date(),
        timeVal: await Dates.getTimeval(ban.time),
        time: await Dates.getTime(ban.time),
    }

    await Dates.calcExpiration(tempban.expiration, ban.time);

    ban.embed.setTitle('Ban')
        .setDescription(`**${ban.member.user.tag}** is banned for **${tempban.time} ${tempban.timeVal}** with reason: **${ban.reason}**!`)
        .setColor(bot.embedColors.embeds.normal);

    await ban.member.createDM().then(async dmChannel => {
        await dmChannel.send(`You got banned from **${message.guild.name}** for **${tempban.time} ${tempban.timeVal}** with reason: **${ban.reason}**!`);
    }).catch(error => {
        ban.embed.addField('No DM sent', `${ban.member.user.tag} was temporary banned but could not be DMed!`);
    });

    await ban.send(ban.embed);

    await ban.member.ban({
        days: 7,
        reason: `${ban.reason}`
    });

    Timers.create({
        guildId: message.guild.id,
        userId: ban.member.id,
        moderatorId: message.author.id,
        type: 'Ban',
        expiration: tempban.expiration.getTime()
    });

    const logEmbed = new MessageEmbed().setTitle('User temporary banned')
        .setColor(bot.embedColors.moderations.ban)
        .setDescription(`**Member:** ${ban.member.user.tag}\n` +
            `**Duration:** ${tempban.time} ${tempban.timeVal}\n` +
            `**Reason:** ${ban.reason}\n` +
            `**Responsible Moderator:** ${message.author.tag}`)
        .setFooter(`ID: ${ban.member.user.id}`)
        .setTimestamp();

    await Logs.modlog(bot, message.guild.members.cache.get(message.author.id), logEmbed);
}

async function ban(bot, message, ban) {
    ban.embed.setTitle('Ban')
        .setDescription(`**${ban.member.user.tag}** is banned for reason: **${ban.reason}**.`)
        .setColor(bot.embedColors.embeds.normal);

    await ban.member.createDM().then(async dmChannel => {
        await dmChannel.send(`You got banned from **${message.guild.name}** with reason: **${ban.reason}**!`);
    }).catch(error => {
        ban.embed.addField('No DM sent', `${ban.member.user.tag} was banned but could not be DMed!`);
    });

    await message.channel.send(ban.embed);

    await ban.member.ban({
        days: 7,
        reason: ban.reason
    });

    const logEmbed = new MessageEmbed().setTitle('User banned')
        .setColor(bot.embedColors.moderations.ban)
        .setDescription(`**Member:** ${ban.member.user.tag}\n` +
            `**Reason:** ${ban.reason}\n` +
            `**Responsible Moderator:** ${message.author.tag}`)
        .setFooter(`ID: ${ban.member.user.id}`)
        .setTimestamp();

    await Logs.modlog(bot, message.guild.members.cache.get(message.author.id), logEmbed);

    await ServerUser.destroy({
        where: {
            guildId: ban.member.guild.id,
            userId: ban.member.user.id
        }
    });
}