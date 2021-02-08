const {MessageEmbed} = require('discord.js');
const {Servers} = require('../../misc/tools');

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'pat',
    category: 'reactions',
    description: 'Pat someone',
    usage: '[command | alias] <mention / id>',
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        let userMentions = [];
        let text;
        let members = '';

        if (args[0]){
            await Servers.getMembers(message, args, userMentions).then(membersPromise => {
                members = membersPromise;
            });
        }

        if (message.mentions.everyone > 0)
            members += '@everyone ';

        let author = message.guild.members.cache.get(message.author.id);

        embed.setImage(getGif(bot).toString())
            .setFooter('Powered by lost hopes and dreams');

        if (members.length === 0) {
            userMentions.push(author.user.id)
            text = `*Pats* ${author}!`;
        } else
            text = `${members}you have been patted by **${author.nickname === null ? author.user.username : author.nickname}**!`;

        await message.channel.send(
            {
                content: text,
                embed: embed,
                allowedMentions: {
                    users: userMentions,
                }
            }
        );
    }
}

function getGif(bot) {
    return bot.reactions.pat[getRandom(bot.reactions.pat.length)];
}

function getRandom(max) {
    return Math.floor(Math.random() * Math.floor(max));
}