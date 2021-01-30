const {MessageEmbed} = require('discord.js');
const tools = require("../../misc/tools");

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'avatar',
    aliases: ['av', 'pfp'],
    category: 'info',
    description: 'Get the avatar of yourself/another person',
    usage: '[command | alias] <mention/id>',
    examples: ['s!av', 's!av 418037700751261708', 's!av @Drag0n#6666'],
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);

        //<editor-fold defaultstate="collapsed" desc="Used variable declarations">
        //find the member if one is asked if not then use the author
        let member;

        await tools.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        if (!member)
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid user ID or mention!'));

        //</editor-fold>

        //<editor-fold defaultstate="collapsed" desc="embed creation">
        embed.setTitle(`avatar of: ${member.user.username}#${member.user.discriminator}`)
            .setImage(member.user.avatarURL({
                dynamic: true,
                size: 4096
            }));
        // </editor-fold>

        await message.channel.send(embed);
    }
}