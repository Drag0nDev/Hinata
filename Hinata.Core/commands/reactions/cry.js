const {MessageEmbed} = require('discord.js');
const cry = require('../../misc/reactions.json').cry;

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'cry',
    category: 'reactions',
    description: 'Show a crying gif',
    usage: '[command | alias]',
    //</editor-fold>
    run: async (bot, message) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.embeds.normal);

        embed.setImage(getGif())
            .setFooter('Powered by lost hopes and dreams');

        let text = `Aww don't cry ${message.author}. I will hug you!`;

        await message.channel.send(
            {
                content: text,
                embed: embed
            }
        );
    }
}

function getGif() {
    return cry[getRandom(cry.length)];
}

function getRandom(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
