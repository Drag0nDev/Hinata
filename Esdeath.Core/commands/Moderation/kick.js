const {Guild} = require("discord.js")

module.exports = {
    name: 'kick',
    category: 'Moderation',
    description: 'Kick a member from the server',
    usage: '[command | alias] [Member mention/id] <reason>',
    run: async (bot, message, args) => {
        let response;

        //check member permissions
        if (!message.member.hasPermission('KICK_MEMBERS')) {
            return message.channel.send(`${message.author} you do not have the **kick** permission!`);
        }

        //check bot permissions
        if (!message.guild.me.hasPermission("KICK_MEMBERS")) {
            return message.channel.send('I do not have the required permission to kick members!');
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        //check if member is in the server
        if (!member) {
            return message.channel.send("No member found with this id/name!");
        }

        //check if member is kickable
        if (!member.kickable) {
            return message.channel.send(`I can't kick ${member.user.tag} due to role hierarchy!`);
        }

        //check if it is self kick, or bot kick
        if (member.user.id === message.author.id || message.guild.me.id === member.user.id) {
            return message.channel.send("You can't kick yourself/the bot!");
        }

        args.shift();

        //kick the member
        if (!args[0]) {
            await member.kick('No reason provided');
            message.channel.send(`**${member.user.tag}** got kicked for reason: no reason provided`);

        } else {
            await member.kick(`${args.join(' ')}`);
            message.channel.send(`**${member.user.tag}** got kicked for reason: **${args.join(' ')}**`);

        }
    }
}