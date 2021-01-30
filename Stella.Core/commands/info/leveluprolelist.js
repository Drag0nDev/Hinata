const {MessageEmbed} = require('discord.js');
const {Rewards} = require('../../misc/dbObjects');
const tools = require('../../misc/tools');

module.exports = {
    name: 'leveluprolelist',
    aliases: ['lurl'],
    category: 'info',
    description: 'View all the level roles and their corresponding level.',
    usage: '[command / alias]',
    examples: ['s!lurl'],
    run: async (bot, message) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal)
            .setThumbnail(message.guild.iconURL({dynamic: true}))
            .setTitle('Level up role list')

        await Rewards.findAll({
            where: {
                serverId: message.guild.id
            },
            order: [
                ['xp', 'DESC']
            ]
        }).then(rewards => {
            let rewardsStr = '';
            rewards.forEach(reward => {
                let level = tools.getLevel(reward.xp);
                rewardsStr += `**Level ${level}**: <@&${reward.roleId}>\n`
            });
            embed.setDescription(rewardsStr);
        });

        await message.channel.send(embed);
    }
}