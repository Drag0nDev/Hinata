const {MessageEmbed} = require("discord.js");
const {Autofeeds} = require('../../misc/dbObjects');

module.exports = {
    name: 'redditlist',
    aliases: ['rl'],
    category: 'autofeeds',
    description: 'Show a list of all followed subreddits',
    usage: '[command | alias]',
    cooldown: 5,
    run: async (bot, message) => {
        const list = {
            send: async (embed) => {
                return message.channel.send(embed);
            },
            embed: new MessageEmbed().setTitle('Reddit list')
                .setTimestamp()
                .setColor(bot.embedColors.normal),
            autofeeds: await Autofeeds.findAll({
                where: {
                    serverId: message.guild.id
                }
            }),
            list: 'A list of all subreddits followed:\n\n'
        }

        list.autofeeds.forEach(autofeed => {
            list.list += `**${autofeed.subreddit}**\n`
        });

        list.embed.setDescription(list.list);

        await list.send(list.embed);
    }
}