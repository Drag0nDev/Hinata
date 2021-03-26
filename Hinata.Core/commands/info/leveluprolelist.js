const {MessageEmbed} = require('discord.js');
const {Rewards} = require('../../misc/dbObjects');
const {Levels} = require('../../misc/tools');

module.exports = {
    name: 'leveluprolelist',
    aliases: ['lurl'],
    category: 'info',
    description: 'View all the level roles and their corresponding level.',
    usage: '[command / alias]',
    examples: ['h!lurl'],
    cooldown: 10,
    run: async (bot, message) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.embeds.normal)
            .setThumbnail(message.guild.iconURL({dynamic: true}))
            .setTitle('Level up role list')
        let rewards;

        rewards = await Rewards.findAll({
            where: {
                serverId: message.guild.id
            },
            order: [
                ['xp', 'DESC']
            ]
        });

        let rewardsStr = '';
        rewards.forEach(reward => {
            let level = Levels.getLevel(reward.xp);
            rewardsStr += `**Level ${level}**: <@&${reward.roleId}>\n`
        });

        embed.setDescription(rewardsStr);

        await message.channel.send(embed);
    }
}