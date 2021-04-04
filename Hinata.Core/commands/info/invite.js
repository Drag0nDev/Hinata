const {MessageEmbed} = require('discord.js');
const logger = require("log4js").getLogger();

module.exports = {
    name: 'invite',
    aliases: ['i'],
    category: 'info',
    description: 'Invitelink for the bot',
    usage: '[command / alias]',
    examples: ['h!invite'],
    cooldown: 10,
    run: async (bot, message) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.embeds.normal);

        bot.generateInvite({
            permissions: [
                //for everything
                "ADMINISTRATOR",
                //when the person cant give admin permissions or they dont want the bot to have it
                "KICK_MEMBERS", "BAN_MEMBERS", "MUTE_MEMBERS",
                "MANAGE_CHANNELS", "MANAGE_GUILD",
                "ADD_REACTIONS",
                "VIEW_AUDIT_LOG", "VIEW_CHANNEL",
                "SEND_MESSAGES", "MANAGE_MESSAGES", "EMBED_LINKS", "ATTACH_FILES",
                "READ_MESSAGE_HISTORY", "USE_EXTERNAL_EMOJIS",
                "USE_VAD",
                "CHANGE_NICKNAME",
                "MANAGE_NICKNAMES", "MANAGE_ROLES", "MANAGE_WEBHOOKS", "MANAGE_EMOJIS"
            ]
        }).then(link => {
            embed.setDescription(`Invite me to your server: [link](${link}).`);
            message.channel.send(embed);
        }).catch(err => {
            logger.error(err);
        });
    }
}