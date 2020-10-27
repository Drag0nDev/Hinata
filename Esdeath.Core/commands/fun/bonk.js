const config = require("../../../config.json");
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'bonk',
    category: 'fun',
    description: 'Bonk a user',
    usage: '[command | alias] [mention user]',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('bonk')
            .setTimestamp()
            .setColor(bot.embedColors.normal);

        if (message.mentions.members.first()) {
            const member = message.mentions.members.first();
            if (message.mentions.members.first().user.id === `${config.OWNER}`) {
                embed.setDescription(`${message.author} <a:bonk:735549944814895115>, don't bonk my master!`);
            } else {
                embed.setDescription(`<@${member.user.id}> <a:bonk:735549944814895115>`);
            }
        } else {
            embed.setDescription('Please mention a user!');
        }

        await message.channel.send(embed);
    }
}