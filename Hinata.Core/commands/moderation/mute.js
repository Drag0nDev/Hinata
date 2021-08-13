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
        const $mute = {
            send: async (msg) => {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setTitle('Mute'),
            checkTemp: new RegExp('^[0-9]*[smhd]'),
            reason: 'No reason provided',
            guild: message.guild,
        };

        //check if there is an argument
        if (!args[0])
            return message.channel.send($mute.embed.setDescription('No user found with this id/name')
                .setColor(bot.embedColors.embeds.error));

        $mute.member = await Servers.getMember(message, args);

        //check if member is in the server
        if (!$mute.member) {
            return message.channel.send("No member found with this id/name!");
        }

        if (!Compare.compareRoles(message.guild.members.cache.get(message.author.id), $mute.member)) {
            return message.channel.send($mute.embed.setTitle('Action not allowed!')
                .setColor(bot.embedColors.embeds.error)
                .setDescription(`You can't mute **${$mute.member.user.tag}** due to role hierarchy!`));
        }

        $mute.settings = await ServerSettings.findOne({
            where: {
                serverId: message.guild.id
            }
        });

        console.log($mute.settings)

        if (!$mute.settings.muteRoleId) {
            await $mute.embed.setDescription('Please provide a valid muterole for this command to work')
                .setColor(bot.embedColors.embeds.error);
            return message.channel.send($mute.embed);
        }

        $mute.muteRole = $mute.guild.roles.cache.get($mute.settings.muteRoleId);

        if(!$mute.muteRole) {
            await $mute.embed.setDescription('Please provide a valid muterole for this command to work')
                .setColor(bot.embedColors.embeds.error);
            return message.channel.send($mute.embed);
        }

        //check if assigned role is higher then bots highest role
        let roleCheck = Permissions.checkRolePosition(bot, message, $mute.muteRole);
        if (roleCheck)
            return await message.channel.send($mute.embed);

        await args.shift();

        if ($mute.checkTemp.exec(args[0])) {
            let time = $mute.checkTemp.exec(args[0])[0];
            await args.shift();

            if (args[0])
                $mute.reason = args.join(' ');

            await tempmute(bot, message, $mute.member, $mute.embed, $mute.muteRole, time, $mute.reason);
        } else {
            if (args[0])
                $mute.reason = args.join(' ');

            await mute(bot, message, $mute.member, $mute.embed, $mute.muteRole, $mute.reason);
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
        .setColor(bot.embedColors.embeds.normal);

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
        .setColor(bot.embedColors.moderations.mute)
        .setDescription(`**Member:** ${member.user.tag}\n` +
            `**Duration:** ${$time} ${timeVal}\n` +
            `**Reason:** ${reason}\n` +
            `**Responsible Moderator:** ${message.author.tag}`)
        .setFooter(`ID: ${member.user.id}`)
        .setTimestamp();

    await Logs.modlog(bot, member, logEmbed);
}

async function mute(bot, message, member, embed, muteRole, reason) {
    await member.createDM()
        .then(async dmChannel => {
            await dmChannel.send(`You got muted in **${message.guild.name}** with reason: **${reason}**!`);
        });

    await Roles.giveRole(member, muteRole);

    embed.setTitle('Mute')
        .setDescription(`**${member.user.tag}** is muted for reason: **${reason}**.`)
        .setColor(bot.embedColors.embeds.normal);

    await message.channel.send(embed);

    const logEmbed = new MessageEmbed().setTitle('User muted')
        .setColor(bot.embedColors.moderations.mute)
        .setDescription(`**Member:** ${member.user.tag}\n` +
            `**Reason:** ${reason}\n` +
            `**Responsible Moderator:** ${message.author.tag}`)
        .setFooter(`ID: ${member.user.id}`)
        .setTimestamp();

    await Logs.modlog(bot, member, logEmbed);
}