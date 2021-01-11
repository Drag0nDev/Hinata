const {MessageEmbed} = require("discord.js");
const tools = require('../../misc/tools');

module.exports = {
    name: 'kick',
    category: 'moderation',
    description: 'Kick a member from the server',
    usage: '[command | alias] [Member mention/id] <reason>',
    neededPermissions: ['KICK_MEMBERS'],
    run: async (bot, message, args) => {
        const neededPerm = ['KICK_MEMBERS'];
        let reason;
        let embed = new MessageEmbed().setTimestamp().setColor(bot.embedColors.kick).setTitle('User kicked');
        let guild = message.guild;

        //check if there is an argument
        if (!args[0])
            return message.channel.send('Please provide a user to kick!');

        //check member and bot permissions
        let noUserPermission = tools.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = tools.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        let member;

        await tools.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });
        const author = message.guild.members.cache.get(message.author.id);

        //check if member is in the server
        if (!member) {
            return message.channel.send("No member found with this id/name!");
        }

        const canKick = tools.compareRoles(author, member);

        //check if member is kickable
        if (!member.kickable) {
            return message.channel.send(`I can't kick **${member.user.tag}** due to role hierarchy!`);
        }

        //check if it is self kick, or bot kick
        if (member.user.id === message.author.id) {
            return message.channel.send("You can't kick yourself");
        }

        //check if the author has a higher role then the member
        if (!canKick)
            return message.channel.send(`You can't kick **${member.user.tag}** due to role hierarchy!`);

        args.shift();

        //kick the member
        if (!args[0]) {
            reason = 'No reason provided';
        } else {
            reason = args.join(' ');
        }

        const dmChannel = await member.createDM()
        await dmChannel.send(`You got kicked from **${guild.name}** with reason: **${reason}**!`);

        await member.kick(`${reason}`);
        message.channel.send(`**${member.user.tag}** got kicked for reason: **${reason}**`);

        embed.setDescription(`**Member:** ${member.user.tag}\n` +
            `**Reason:** ${reason}\n` +
            `**Responsible moderator:** ${message.author.tag}`)
            .setFooter(`ID: ${member.id}`);

        const channel = bot.channels.cache.find(channel => channel.id === '763039768870649856');
        await channel.send(embed);
    }
}