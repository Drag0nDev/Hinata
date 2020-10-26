const {MessageEmbed} = require('discord.js');

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="serverinfo help">
    name: 'serverIcon',
    aliases: ['si', 'icon'],
    category: 'info',
    description: 'see the icon of the server',
    usage: '[command | alias]',
    //</editor-fold>
    run: async (bot, message) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal.code);

        //<editor-fold defaultstate="collapsed" desc="Used variable declarations">
        //simplify the guild
        let guild = message.guild;
        //</editor-fold>

        //<editor-fold defaultstate="collapsed" desc="embed creation">
        embed.setTitle(`Server icon of server: ${guild.name}`)
            .setImage(guild.iconURL({
                dynamic: true,
                size: 4096
            }));
        //</editor-fold>

        await message.channel.send(embed);
    }
}