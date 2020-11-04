const {MessageEmbed} = require('discord.js');
const { User } = require('../../../dbObjects');
const Sequelize = require('sequelize');
const pm = require('parse-ms');

module.exports = {
    name: 'daily',
    category: 'currency',
    description: 'Do your daily claim',
    usage: '[command | alias]',
    run: async (bot, message) => {
        const dailyReward = 100;
        const now = new Date();

        User.findOne({
            where: {
                userId: message.author.id
            }
        }).then(user => {
            let embed = new MessageEmbed();

            const diff = pm(now.getTime() - parseInt(user.dailyTaken))

            if (diff.days !== 1){
                if (diff.days === 0){
                    let timeLeft = `${23 - diff.hours} hours ${59 - diff.minutes} minutes ${59 - diff.seconds} seconds`;
                    embed.setColor(bot.embedColors.error)
                        .setDescription(`You can claim your next daily in: **${timeLeft}**`);
                    message.channel.send(embed);
                    return;
                } else {
                    user.dailyStreak = 0;
                    user.save();
                }
            }

            const daily = dailyReward + ((dailyReward / 10) * user.dailyStreak);

            user.dailyTaken = message.createdTimestamp;
            User.add(user, daily);
            user.save();

            embed.setColor(bot.embedColors.normal)
                .setDescription(`You have claimed your daily of **${daily} ${bot.currencyEmoji}**\n
                Your total balance now is at **${user.balance} ${bot.currencyEmoji}**\n
                Your daily streak is at **${user.dailyStreak} day(s)**`);
            message.channel.send(embed);
        });
    }
}

Reflect.defineProperty(User, 'add', {
    value: async function add(user, amount) {
        user.balance += amount;
        user.dailyStreak++;
        user.save();
    }
});