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
        let embed = new MessageEmbed().setTimestamp().setColor(bot.embedColors.unban).setTitle('User unbanned');
        let guild = message.guild;
        let member;

        //check if there is an argument
        if (
            !args[0]
            && isNaN(parseInt(args[0]))
        )
            return message.channel.send('Please provide a valid id to unban!');

        const id = args.shift();

        //check member and bot permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = Permissions.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        const author = message.guild.members.cache.get(message.author.id);

        await message.guild.fetchBans()
            .then(banList => {
                member = banList.get(id);
            });

        if (!member)
            return message.channel.send(`The member with id **${id}** member is not banned!`);

        if (args[0])
            reason = args.join(' ');

        if (reason.length > 1000){
            embed.setColor(bot.embedColors.error)
                .setDescription('The reason is too long.\n' +
                    'Keep it under 1000 characters.')
                .setTimestamp();

            return await message.channel.send(embed);
        }

        await guild.members.unban(id, reason);

        message.channel.send(`**${member.user.tag}** got unbanned for reason: **${reason}**`);

        const logEmbed = new MessageEmbed().setTitle('User unbanned')
            .setColor(bot.embedColors.softban)
            .setDescription(`**Member:** ${member.user.tag}\n` +
                `**Reason:** ${reason}\n` +
                `**Responsible Moderator:** ${message.author.tag}`)
            .setFooter(`ID: ${member.user.id}`)
            .setTimestamp();

        await Logs.modlog(message.guild.members.cache.get(message.author.id), logEmbed);
    }
}