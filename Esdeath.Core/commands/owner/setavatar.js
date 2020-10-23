const config = require("../../../config.json");
const {MessageEmbed} = require('discord.js');
const log4js = require("log4js");

module.exports = {
    name: 'setavatar',
    aliases: ['changeavatar', 'newavatar'],
    category: 'owner',
    description: 'Command to change Esdeaths profilepicture',
    usage: '[command | alias] [link new picture]',
    run: (bot, message, args) => {
        const logger = log4js.getLogger();
        let embed = new MessageEmbed();

        if (!(message.member.id === config.OWNER))
            return message.channel.send(embed.setDescription(`${message.author} this is a command only for my creator!`)
                .setColor(bot.embedColors.error));

        bot.user.setAvatar(args.toString()).then(updated => {
            embed.setTitle(`setavatar`)
                .setColor(bot.embedColors.normal)
                .setDescription('Avatar changed successfully to:')
                .setImage(bot.user.avatarURL({dynamic: true, size: 4096}));

                message.channel.send(embed);
            }
        ).catch(err => {
            embed.setDescription(err.message.toString().replace("Invalid Form Body\n" +
                "avatar:", ""))
                .setColor(bot.embedColors.error);
            message.channel.send(embed);
        })

    }
}