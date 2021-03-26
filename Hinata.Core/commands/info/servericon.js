const {MessageEmbed} = require('discord.js');

module.exports = {
    name: 'servericon',
    aliases: ['si', 'icon'],
    category: 'info',
    description: 'see the icon of the server',
    usage: '[command | alias]',
    examples: ['h!si'],
    cooldown: 10,
    run: async (bot, message) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.embeds.normal);

        //simplify the guild
        let guild = message.guild;

        embed.setTitle(`Server icon of server: ${guild.name}`)
            .setImage(guild.iconURL({
                dynamic: true,
                size: 4096
            }));

        await message.channel.send(embed);
    }
}