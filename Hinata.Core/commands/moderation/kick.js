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
        const kick = {
            send: async (msg) => {
                await message.channel.send(msg);
            },
            reason: 'No reason provided',
            embed: new MessageEmbed().setTimestamp().setColor(bot.embedColors.moderations.kick),
            guild: message.guild,
        };

        //check if there is an argument
        if (!args[0])
            return kick.send(kick.embed
                .setColor(bot.embedColors.embeds.error)
                .setDescription('Please provide a user to kick!'));

        kick.member = await Servers.getMember(message, args);
        kick.author = message.guild.members.cache.get(message.author.id);

        //check if member is in the server
        if (!kick.member)
            return kick.send(kick.embed
                .setColor(bot.embedColors.embeds.error)
                .setDescription(`No member found with this id or name`));


        const canKick = Compare.compareRoles(kick.author, kick.member);

        //check if member is kickable
        if (!kick.member.kickable)
            return kick.send(kick.embed.setTitle('Action not allowed!')
                .setColor(bot.embedColors.embeds.error)
                .setDescription(`I can't kick **${kick.member.user.tag}** due to role hierarchy!`));

        //check if it is self kick, or bot kick
        if (kick.member.user.id === message.author.id)
            return kick.send(kick.embed.setTitle('Action not allowed!')
                .setColor(bot.embedColors.embeds.error)
                .setDescription(`You can't kick yourself!`));

        //check if the author has a higher role then the member
        if (!canKick)
            return kick.send(kick.embed.setTitle('Action not allowed!')
                .setColor(bot.embedColors.embeds.error)
                .setDescription(`You can't kick **${kick.member.user.tag}** due to role hierarchy!`));

        await args.shift();

        //kick the member
        if (args[0])
            kick.reason = args.join(' ');

        await kick.member.createDM().then(async dmChannel => {
            await dmChannel.send(`You got kicked from **${kick.guild.name}** with reason: **${kick.reason}**!`);
        }).catch(error => {
            kick.embed.addField('No DM sent', `${kick.member.user.tag} was kicked but could not be DMed!`);
        });

        await kick.member.kick(`${kick.reason}`);
        await kick.send(kick.embed.setTitle('User kicked')
            .setDescription(`**${kick.member.user.tag}** got kicked for reason: **${kick.reason}**`));

        const logEmbed = new MessageEmbed()
            .setTitle('User kicked')
            .setColor(bot.embedColors.moderations.kick)
            .setDescription(`**Member:** ${kick.member.user.tag}\n` +
                `**Reason:** ${kick.reason}\n` +
                `**Responsible moderator:** ${message.author.tag}`)
            .setFooter(`ID: ${kick.member.id}`);

        await Logs.modlog(bot, message.guild.members.cache.get(message.author.id), logEmbed);
    }
}