const {MessageEmbed} = require('discord.js');
const {Servers} = require('../../misc/tools');
const grope = require('../../misc/reactions.json').grope;

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'grope',
    category: 'reactions',
    description: 'Grope someone',
    usage: '[command | alias] <mention / id>',
    //</editor-fold>
    run: async (bot, message, args) => {
        const reaction = {
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal),
            userMentions: [],
            members: '',
        }

        if (!message.channel.nsfw) {
            reaction.embed.setDescription('This command can only be used in an NSFW marked channel!');
            return message.channel.send(reaction.embed);
        }

        if (args[0])
            reaction.members = await Servers.getMembers(message, args, reaction.userMentions);

        if (message.mentions.everyone > 0)
            reaction.members += '@everyone ';

        reaction. author = await message.guild.members.cache.get(message.author.id);

        embed.setImage(getGif())
            .setFooter('Powered by lost hopes and dreams');

        if (reaction.members.length === 0) {
            reaction.userMentions.push(reaction.author.user.id)
            reaction.text = `*gropes* ${reaction.author}!`;
        } else
            reaction.text = `${reaction.members}you have been groped by **${reaction.author.nickname === null ? reaction.author.user.username : reaction.author.nickname}**, *lewd*!`;

        await message.channel.send(
            {
                content: reaction.text,
                embed: reaction.embed,
                allowedMentions: {
                    users: reaction.userMentions,
                }
            }
        );
    }
}

function getGif() {
    return grope[getRandom(grope.length)];
}

function getRandom(max) {
    return Math.floor(Math.random() * Math.floor(max));
}