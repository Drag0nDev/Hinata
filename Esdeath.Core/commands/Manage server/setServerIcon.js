const {MessageEmbed} = require('discord.js');
const log4js = require("log4js");

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'setservericon',
    aliases: ['ssi', 'seticon'],
    category: 'Manage server',
    description: 'Set the server logo',
    usage: '[command | alias] [link]',
    //</editor-fold>
    run: (bot, message, args) => {
        const logger = log4js.getLogger();
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);

        if (!args[0])
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid link'));

        if (!message.member.hasPermission('MANAGE_GUILD'))
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('You do not have the required permission to run this command\n' +
                    '**Missing requirements:** MANAGE_GUILD'));

        let guild = message.guild;

        guild.setIcon(args.toString()).then(updated => {
                embed.setTitle('setservericon')
                    .setColor(bot.embedColors.normal)
                    .setDescription('Server icon changed successfully to:')
                    .setImage(guild.iconURL({dynamic: true, size: 4096}));

                message.channel.send(embed);
            }
        ).catch(err => {
            embed.setDescription(err.message.toString().replace("Invalid Form Body\n", ""))
                .setColor(bot.embedColors.error);
            message.channel.send(embed);
        })
    }
}