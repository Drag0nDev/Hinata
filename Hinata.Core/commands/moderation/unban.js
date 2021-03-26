const {MessageEmbed} = require("discord.js");
const neededPerm = ['BAN_MEMBERS'];
const {Permissions, Logs} = require('../../misc/tools');

module.exports = {
    name: 'unban',
    category: 'moderation',
    description: 'Unban a member from the server',
    usage: '[command | alias] [Member mention/id] <reason>',
    examples: ['h!unban @Drag0n#6666', 'h!unban 418037700751261708'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let reason = 'No reason provided';
        let embed = new MessageEmbed().setTimestamp().setColor(bot.embedColors.moderations.unban);
        let guild = message.guild;
        let member;

        //check if there is an argument
        if (
            !args[0]
            && isNaN(parseInt(args[0]))
        )
            return message.channel.send(embed
                .setColor(bot.embedColors.embeds.error)
                .setDescription('Please provide a user to unban!'));

        const id = args.shift();

        await message.guild.fetchBans()
            .then(banList => {
                member = banList.get(id);
            });

        if (!member)
            return message.channel.send(embed.setDescription(`The member with id **${id}** member is not banned!`));

        if (args[0])
            reason = args.join(' ');

        await guild.members.unban(id, reason);

        message.channel.send(embed.setDescription(`**${member.user.tag}** got unbanned for reason: **${reason}**`));

        const logEmbed = new MessageEmbed().setTitle('User unbanned')
            .setColor(bot.embedColors.moderations.unban)
            .setDescription(`**Member:** ${member.user.tag}\n` +
                `**Reason:** ${reason}\n` +
                `**Responsible Moderator:** ${message.author.tag}`)
            .setFooter(`ID: ${member.user.id}`)
            .setTimestamp();

        await Logs.modlog(bot, message.guild.members.cache.get(message.author.id), logEmbed);
    }
}