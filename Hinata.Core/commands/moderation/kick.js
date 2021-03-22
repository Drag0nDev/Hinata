const {MessageEmbed} = require("discord.js");
const {Permissions, Servers, Logs, Compare} = require('../../misc/tools');
const neededPerm = ['KICK_MEMBERS'];

module.exports = {
    name: 'kick',
    category: 'moderation',
    description: 'Kick a member from the server',
    usage: '[command | alias] [Member mention/id] <reason>',
    examples: ['h!kick @Drag0n#6666', 'h!kick @Drag0n#6666 being a bad boy'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let reason = 'No reason provided';
        let embed = new MessageEmbed().setTimestamp().setColor(bot.embedColors.kick);
        let guild = message.guild;

        //check if there is an argument
        if (!args[0])
            return message.channel.send(embed
                .setColor(bot.embedColors.error)
                .setDescription('Please provide a user to kick!'));

        let member = await Servers.getMember(message, args);
        const author = message.guild.members.cache.get(message.author.id);

        //check if member is in the server
        if (!member)
            return message.channel.send(embed
                .setColor(bot.embedColors.error)
                .setDescription(`No member found with this id or name`));


        const canKick = Compare.compareRoles(author, member);

        //check if member is kickable
        if (!member.kickable)
            return message.channel.send(embed.setTitle('Action not allowed!')
                .setColor(bot.embedColors.error)
                .setDescription(`I can't kick **${member.user.tag}** due to role hierarchy!`));

        //check if it is self kick, or bot kick
        if (member.user.id === message.author.id)
            return message.channel.send(embed.setTitle('Action not allowed!')
                .setColor(bot.embedColors.error)
                .setDescription(`You can't kick yourself!`));

        //check if the author has a higher role then the member
        if (!canKick)
            return message.channel.send(embed.setTitle('Action not allowed!')
                .setColor(bot.embedColors.error)
                .setDescription(`You can't kick **${member.user.tag}** due to role hierarchy!`));

        await args.shift();

        //kick the member
        if (args[0])
            reason = args.join(' ');

        await member.createDM().then(async dmChannel => {
            await dmChannel.send(`You got kicked from **${guild.name}** with reason: **${reason}**!`);
        }).catch(error => {
            embed.addField('No DM sent', `${member.user.tag} was kicked but could not be DMed!`);
        });

        await member.kick(`${reason}`);
        message.channel.send(embed.setTitle('User kicked')
            .setDescription(`**${member.user.tag}** got kicked for reason: **${reason}**`));

        const logEmbed = new MessageEmbed()
            .setTitle('User kicked')
            .setColor(bot.embedColors.kick)
            .setDescription(`**Member:** ${member.user.tag}\n` +
                `**Reason:** ${reason}\n` +
                `**Responsible moderator:** ${message.author.tag}`)
            .setFooter(`ID: ${member.id}`);

        await Logs.modlog(bot, message.guild.members.cache.get(message.author.id), logEmbed);
    }
}