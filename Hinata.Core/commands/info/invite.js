const { MessageEmbed } = require('discord.js');
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
            permissions: ["ADMINISTRATOR"]
        }).then(link => {
            embed.setDescription(`Invite me to your server: [link](${link}).`);
            message.channel.send(embed);
        }).catch(err => {
            logger.error(err);
        })
    }
}