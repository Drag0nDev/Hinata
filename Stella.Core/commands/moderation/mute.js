const {MessageEmbed} = require("discord.js");
const {Timers, Server} = require('../../misc/dbObjects');
const tools = require('../../misc/tools');

module.exports = {
    name: 'mute',
    category: 'moderation',
    description: 'Mute a member from the server for a set time',
    usage: '[command | alias] [Member mention/id] <time (h, m, s)> <reason>',
    neededPermissions: ['MANAGE_ROLES', "MUTE_MEMBERS"],
    run: async (bot, message, args) => {
        let reason;
        let embedLog = new MessageEmbed().setTimestamp()
            .setColor(bot.embedColors.mute)
            .setTitle('User muted');
        let muteRole;
        let confirmationEmbed = new MessageEmbed();
        let expiration = new Date();
        let guild = message.guild;
        let muteRoleId;

        //check if there is an argument
        if (!args[0])
            return message.channel.send('Please provide a user to mute!');

        //check member permissions
        if (!message.member.hasPermission('MANAGE_ROLES')) {
            return message.channel.send(`${message.author} you do not have the **MANAGE_ROLES** permission!`);
        }

        if(!message.member.hasPermission("MUTE_MEMBERS")) {
            return message.channel.send(`${message.author} you do not have the **MUTE_MEMBERS** permission!`);
        }

        //check bot permissions
        if (!message.guild.me.hasPermission("MANAGE_ROLES")) {
            return message.channel.send('I do not have the required permission to mute members!');
        }

        if(!message.guild.me.hasPermission("MUTE_MEMBERS")) {
            return message.channel.send(`I do not have the **MUTE_MEMBERS** permission!`);
        }

        let member;

        await tools.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        const author = message.guild.members.cache.get(message.author.id);

        //check if member is in the server
        if (!member) {
            return message.channel.send("No member found with this id/name!");
        }

        await Server.findOne({
            where: {
                serverId: message.guild.id
            }
        }).then(server => {
            muteRoleId = server.muteRoleId;
        });

        if (muteRoleId === null) {
            confirmationEmbed.setDescription('Please provide a mute role for this command to work')
                .setColor(bot.embedColors.error);
            return message.channel.send(confirmationEmbed);
        } else {
            muteRole = guild.roles.cache.get(muteRoleId);
        }



        if (!timeVal)
            return message.channel.send('Please give a good time');

        if (timeVal === 'h') {
            expiration.setHours(expiration.getHours() + parseInt(time.join('')));
        } else if (timeVal === 'm') {
            expiration.setMinutes(expiration.getMinutes() + parseInt(time.join('')));
        } else if (timeVal === 's') {
            expiration.setSeconds(expiration.getSeconds() + parseInt(time.join('')));
        } else {
            return message.channel.send('Please provide a good time format (h, m, s)!');
        }

        await member.roles.add(muteRole);

        const dmChannel = await member.createDM()
        await dmChannel.send(`You got muted in **${guild.name}** for **${time.join('')}${timeVal}** with reason: **${reason}**!`);

        confirmationEmbed.setTitle('Mute')
            .setDescription(`**${member.user.tag}** is muted for **${time.join('')}${timeVal}** for reason: **${reason}**.`)
            .setColor(bot.embedColors.normal);

        await message.channel.send(confirmationEmbed);

        Timers.create({
            guildId: guild.id,
            userId: member.id,
            moderatorId: message.author.id,
            type: 'Mute',
            expiration: expiration.getTime()
        });
    }
}