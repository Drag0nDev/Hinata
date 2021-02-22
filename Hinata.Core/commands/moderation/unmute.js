const {MessageEmbed} = require("discord.js");
const {Timers, ServerSettings} = require('../../misc/dbObjects');
const {Permissions, Compare, Servers, Roles, Logs} = require('../../misc/tools');
const neededPerm = ['MANAGE_ROLES', "MUTE_MEMBERS"];

module.exports = {
    name: 'unmute',
    category: 'moderation',
    description: 'Unmute a member from the server',
    usage: '[command | alias] [Member mention/id] <reason>',
    examples: ['h!unmute @Drag0n#6666', 'h!unmute 418037700751261708', 'h!unmute @Drag0n#6666 Made a mistake'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let reason = 'No reason provided';
        let muteRole;
        let embed = new MessageEmbed().setTitle('Unmute')
            .setColor(bot.embedColors.normal);
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
            return message.channel.send('Please provide a user to mute!');

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
                .setDescription(`You can't unmute **${member.user.tag}** due to role hierarchy!`));
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

        if (!member._roles.includes(muteRoleId)) {
            embed.setDescription(`**${member.user.tag}** is not muted!`)
                .setColor(bot.embedColors.error);
            return message.channel.send(embed);
        }

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

        await Roles.removeRole(member, muteRole);

        await Timers.findOne({
            where: {
                guildId: guild.id,
                userId: member.user.id
            }
        }).then(async timer => {
            if (timer)
                timer.destroy();
        });

        embed.setDescription(`**${member.user.tag}** unmuted successfully!`)
            .setTimestamp();

        await message.channel.send(embed);

        const logEmbed = new MessageEmbed().setTitle('User unmuted')
            .setColor(bot.embedColors.unban)
            .setDescription(`**Member:** ${member.user.tag}\n` +
                `**Reason:** ${reason}\n` +
                `**Responsible Moderator:** ${message.author.tag}`)
            .setFooter(`ID: ${member.user.id}`)
            .setTimestamp();

        await Logs.modlog(bot, member, logEmbed);
    }
}