const {MessageEmbed} = require("discord.js");
const {Permissions, Compare, Servers, Logs} = require('../../misc/tools');
const neededPerm = ['BAN_MEMBERS'];

module.exports = {
    name: 'softban',
    aliases: ['pruneban'],
    category: 'moderation',
    description: 'Band and quickly unban a member from the server to clear all their messages from the last 7 days',
    usage: '[command | alias] [Member mention/id] <reason>',
    examples: ['h!softban @Drag0n#6666', 'h!sofban @Drag0n#6666 being a bad boy'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let reason = 'No reason provided';
        let embed = new MessageEmbed().setTimestamp().setColor(bot.embedColors.ban).setTitle('Softban');

        //check if there is an argument
        if (!args[0])
            return message.channel.send('Please provide a user to softban!');

        let member;

        await Servers.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });
        const author = message.guild.members.cache.get(message.author.id);

        //check if member is in the server
        if (!member) {
            return message.channel.send("No member found with this id/name!");
        }

        const canBan = Compare.compareRoles(author, member);

        //check if the author has a higher role then the member
        if (!canBan)
            return message.channel.send(`You can't softban **${member.user.tag}** due to role hierarchy!`);
        //check if member is banable
        if (!member.bannable) {
            return message.channel.send(`I can't softban **${member.user.tag}** due to role hierarchy!`);
        }

        //check if it is self ban, or bot ban
        if (member.user.id === message.author.id) {
            return message.channel.send("You can't ban yourself");
        }

        await args.shift();

        if (args[0]) {
            reason = args.join(' ');
        }

        if (reason.length > 1000) {
            embed.setColor(bot.embedColors.error)
                .setDescription('The reason is too long.\n' +
                    'Keep it under 1000 characters.')
                .setTimestamp();

            return await message.channel.send(embed);
        }

        embed.setDescription(`**${member.user.tag}** is softbanned for reason: **${reason}**.`)
            .setColor(bot.embedColors.normal);

        await member.createDM().then(async dmChannel => {
            await dmChannel.send(`You got softbanned from **${message.guild.name}** with reason: **${reason}**!`);
        }).catch(error => {
            embed.addField('No DM sent', `${member.user.tag} was banned but could not be DMed!`);
        });

        await message.channel.send(embed);

        await member.ban({
            days: 7,
            reason: `${reason}`
        }).then(async member => {
            await message.guild.fetchBans()
                .then(banList => {
                    member = banList.get(member.user.id);
                });

            await message.guild.members.unban(member.user.id, reason);
        });

        const logEmbed = new MessageEmbed().setTitle('User softbanned')
            .setColor(bot.embedColors.softban)
            .setDescription(`**Member:** ${member.user.tag}\n` +
                `**Reason:** ${reason}\n` +
                `**Responsible Moderator:** ${message.author.tag}`)
            .setFooter(`ID: ${member.user.id}`)
            .setTimestamp();

        await Logs.modlog(bot, message.guild.members.cache.get(message.author.id), logEmbed);

    }
}