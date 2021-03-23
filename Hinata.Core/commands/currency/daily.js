const {MessageEmbed} = require('discord.js');
const { User } = require('../../misc/dbObjects');
const pm = require('parse-ms');

module.exports = {
    name: 'daily',
    category: 'currency',
    description: 'Do your daily claim',
    usage: '[command | alias]',
    examples: ['h!daily'],
    run: async (bot, message) => {
        let embed = new MessageEmbed();
        const dailyReward = 100;
        const now = new Date();
        let dbUser;
        let daily;

        dbUser = await User.findOne({
            where: {
                userId: message.author.id
            }
        });

        if (dbUser.isBanned === 1)
            return embed.setColor(bot.embedColors.error)
                .setTitle('You have a botban')
                .setTimestamp()
                .setDescription('You can\'t claim dailies due to being banned from using the daily command.\n' +
                    'You will also not earn any xp globaly with the botban.');

        const diff = pm(now.getTime() - parseInt(dbUser.dailyTaken));

        let hours = 23 - diff.hours;
        let minutes = 59 - diff.minutes;
        let seconds = 59 - diff.seconds;

        let timeLeft = '';

        if (hours > 0)
            timeLeft = `${hours} hours ${minutes} minutes ${seconds} seconds`;
        else {
            if (minutes > 0)
                timeLeft = `${minutes} minutes ${seconds} seconds`;
            else
                timeLeft = `${seconds} seconds`;
        }

        if (diff.days !== 1){
            if (diff.days === 0){
                embed.setColor(bot.embedColors.error)
                    .setDescription(`You can claim your next daily in: **${timeLeft}**`);
                message.channel.send(embed);
                return;
            } else {
                dbUser.dailyStreak = 0;
                dbUser.save();
            }
        }

        daily = dailyReward + ((dailyReward / 10) * dbUser.dailyStreak);

        dbUser.dailyTaken = message.createdTimestamp;
        User.addDaily(dbUser, daily);

        embed.setColor(bot.embedColors.normal)
            .setDescription(`You have claimed your daily of **${daily} ${bot.currencyEmoji}**\n` +
                `Your total balance now is at **${dbUser.balance} ${bot.currencyEmoji}**\n` +
                `Your daily streak is at **${dbUser.dailyStreak - 1} day(s)**`);

        message.channel.send(embed);
    }
}