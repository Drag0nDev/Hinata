const {MessageEmbed} = require("discord.js");

module.exports = {
    name: 'kick',
    category: 'moderation',
    description: 'Kick a member from the server',
    usage: '[command | alias] [Member mention/id] <reason>',
    run: async (bot, message, args) => {
        let reason;
        let embed = new MessageEmbed().setTimestamp().setColor(bot.embedColors.kick).setTitle('User kicked');
        let guild = message.guild;

        //check if there is an argument
        if (!args[0])
            return message.channel.send('Please provide a user to kick!');

        //check member permissions
        if (!message.member.hasPermission('KICK_MEMBERS')) {
            return message.channel.send(`${message.author} you do not have the **kick** permission!`);
        }

        //check bot permissions
        if (!message.guild.me.hasPermission("KICK_MEMBERS")) {
            return message.channel.send('I do not have the required permission to kick members!');
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        const author = message.guild.members.cache.get(message.author.id);

        //check if member is in the server
        if (!member) {
            return message.channel.send("No member found with this id/name!");
        }

        const canKick = compareRoles(author, member);

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

function compareRoles(author, member) {
    let roleArrayAuth = [];
    let roleArrayMemb = [];

    //get all the roles and their objects in an array
    author._roles.forEach(roleId => {
        roleArrayAuth.push(member.guild.roles.cache.get(roleId));
    });

    member._roles.forEach(roleId => {
        roleArrayMemb.push(member.guild.roles.cache.get(roleId));
    });

    roleArrayAuth.sort((a, b) => b.position - a.position);
    roleArrayMemb.sort((a, b) => b.position - a.position);

    return roleArrayAuth[0].position > roleArrayMemb[0].position;
}