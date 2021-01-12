const {MessageEmbed} = require("discord.js");
const neededPerm = ['BAN_MEMBERS'];
const tools = require('../../misc/tools');

module.exports = {
    name: 'unban',
    category: 'moderation',
    description: 'Unban a member from the server',
    usage: '[command | alias] [Member mention/id] <reason>',
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let reason;
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
        let noUserPermission = tools.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = tools.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        const author = message.guild.members.cache.get(message.author.id);

        await message.guild.fetchBans()
            .then(banList => {
                member = banList.get(id);

                if (!member)
                    return message.channel.send(`The member with id **${id}** member is not banned!`);
            });

        if (!args[0]) {
            reason = 'No reason provided';
        } else {
            reason = args.join(' ');
        }

        await guild.members.unban(id, reason);

        message.channel.send(`**${member.user.tag}** got unbanned for reason: **${reason}**`);

        embed.setDescription(`**Member:** ${member.user.tag}\n` +
            `**Reason:** ${reason}\n` +
            `**Responsible moderator:** ${author.tag}`)
            .setFooter(`ID: ${member.id}`);

        const channel = bot.channels.cache.find(channel => channel.id === '763039768870649856');
        await channel.send(embed);
    }
}