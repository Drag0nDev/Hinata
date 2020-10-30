const {MessageEmbed} = require('discord.js');

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'esdeath',
    category: 'reactions',
    description: 'Show a gif of esdeath',
    usage: '[command | alias]',
    //</editor-fold>
    run: async (bot, message) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);

        embed.setImage(getGif(bot).toString())
            .setFooter('Powered by lost hopes and dreams');

        await message.channel.send(embed);
    }
}

function getGif(bot) {
    let number = getRandom(Object.keys(bot.reactions.esdeath).length);

    return bot.reactions.esdeath[number];
}

function getRandom(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
