const {MessageEmbed} = require('discord.js');
const logger = require("log4js").getLogger();

module.exports = {
    name: 'invite',
    aliases: ['i'],
    category: 'info',
    description: 'Invitelink for the bot',
    usage: '[command / alias]',
    examples: ['h!invite'],
    run: async (bot, message) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);

        bot.generateInvite({
            permissions: [
                "ADD_REACTIONS", "ATTACH_FILES", "BAN_MEMBERS", "CHANGE_NICKNAME", "EMBED_LINKS", "KICK_MEMBERS",
                "MANAGE_CHANNELS", "MANAGE_GUILD", "MANAGE_EMOJIS", "MANAGE_MESSAGES", "MANAGE_WEBHOOKS", "CREATE_INSTANT_INVITE",
                "SEND_MESSAGES", "READ_MESSAGE_HISTORY", "USE_EXTERNAL_EMOJIS", "VIEW_AUDIT_LOG", "VIEW_CHANNEL"
            ]
        }).then(link => {
            embed.setDescription(`Invite me to your server: [link](${link}).`);
            message.channel.send(embed);
        }).catch(err => {
            logger.error(err);
        })
    }
}