const {MessageEmbed} = require('discord.js');

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'kiss',
    category: 'Reactions',
    description: 'kiss someone',
    usage: '[command | alias] <mention / id>',
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);

        let text;
        let members;

        if (args[0])
            members = getMentions(message, args);

        let author = message.guild.members.cache.get(message.author.id);

        embed.setImage(getGif(bot).toString())
            .setFooter('Powered by lost hopes and dreams');

        if (!args[0])
            text = `*Kisses* ${author}!`;
        else
            text = `${members} you have been kissed by **${author.nickname === null ? author.user.username : author.nickname}**!`;

        await message.channel.send(
            {
                content: text,
                embed: embed
            }
        );
    }
}

function getGif(bot) {
    let number = getRandom(Object.keys(bot.reactions.hug).length - 1);

    return bot.reactions.kiss[number];
}

function getRandom(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function getMentions(message, input){
    let members = '';

    if (message.mentions.users.size > 0) {
        message.mentions.users.forEach(user => {
            members += `<@!${user.id}> `
        });
    } else {
        input.forEach(id => {
            members += `<@!${id}> `
        });
    }

    return members;
}