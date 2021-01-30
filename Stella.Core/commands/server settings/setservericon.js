const {MessageEmbed} = require('discord.js');
const log4js = require("log4js");
let neededPerm = ['MANAGE_GUILD'];
const tools = require("../../misc/tools");

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'setservericon',
    aliases: ['ssi', 'seticon'],
    category: 'server settings',
    description: 'Set the server logo',
    usage: '[command | alias] [link]',
    examples: ['s!ssi https://cdn.discordapp.com/icons/645047329141030936/d7954367430664e570ba8f43d5e2d072.webp?size=4096'],
    neededPermissions: neededPerm,
    //</editor-fold>
    run: async (bot, message, args) => {
        const logger = log4js.getLogger();
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);

        //check member and bot permissions
        let noUserPermission = tools.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = tools.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        if (!args[0])
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid link'));

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