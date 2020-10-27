const {MessageEmbed} = require('discord.js');

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="serverinfo help">
    name: 'setservername',
    aliases: ['ssn', 'servername'],
    category: 'Manage server',
    description: 'Set a new server name',
    usage: '[command | alias] [new name]',
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let neededPerm = ['MANAGE_GUILD'];

        //<editor-fold defaultstate="collapsed" desc="Used variable declarations">
        //simplify the guild
        let guild = message.guild;

        //check if new name is given
        if(!args[0])
            return message.channel.send(
                embed.setDescription('Please give a new name for the server')
                    .setColor(bot.embedColors.error)
            );

        //check if members has the right permission
        if (!message.member.hasPermission(neededPerm))
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription(`You don't have the required permission to run this command\n` +
                    `**Missing requirements:** ${neededPerm}`));

        if (!message.guild.me.hasPermission(neededPerm))
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription(`I don't have the required permission to run this command\n` +
                    `**Missing requirements:** ${neededPerm}`));

        //new server name
        let newName = args.join(' ');

        //save the old server name
        let oldName = message.guild.name;
        //</editor-fold>

        guild.setName(newName)
            .then(updated => {
                embed.setTitle(guild.name)
                    .setThumbnail(guild.iconURL())
                    .setDescription(`Successfully changed the name from **${oldName}** to **${updated.name}**`)
                    .setColor(bot.embedColors.normal);
                message.channel.send(embed);
            })
            .catch(err => {
                embed.setDescription(err.message.toString().replace("Invalid Form Body\n", ""))
                    .setColor(bot.embedColors.error);
                message.channel.send(embed);
            });
    }
}