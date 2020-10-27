const config = require("../../../config.json")
const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'leaveGuild',
    aliases: ['lg', 'ls', 'leaveserver'],
    category: 'owner',
    description: 'Make the bot leave a guild',
    usage: '[command | alias]',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('Leave Guild');

        if (!(message.member.id === config.OWNER)) {
            embed.setColor(bot.embedColors.error)
                .setDescription('This command is only for my owner!');
        } else {

            //check if serverid is given
            if (!args[0]){
                embed.setDescription(`No server id given`)
                    .setColor(bot.embedColors.error);
                return message.channel.send(embed);
            }

            try {
                bot.guilds.cache.get(args[0])
                    .leave()
                    .catch(err => {
                        embed.setDescription(err)
                            .setColor(bot.embedColors.error);
                    });
                embed.setDescription(`Left the guild **${bot.guilds.cache.get(args[0])}**`)
                    .setColor(bot.embedColors.normal);
            } catch {
                embed.setDescription(`No server found with id: **${args[0]}**`)
                    .setColor(bot.embedColors.error);
            }
        }

        await message.channel.send(embed);
    }
}