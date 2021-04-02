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
        const daily = {
            send: async (msg) => {
                return message.channel.send(msg)
            },
            embed: new MessageEmbed(),
            dailyReward: 100,
            now: new Date(),
        }

        daily.dbUser = await User.findOne({
            where: {
                userId: message.author.id
            }
        });

        if (daily.dbUser.isBanned === 1)
            return daily.send(daily.embed.setColor(bot.embedColors.embeds.error)
                .setTitle('You have a botban')
                .setTimestamp()
                .setDescription('You can\'t claim dailies due to being banned from using the daily command.\n' +
                    'You will also not earn any xp globaly with the botban.'));

        const diff = pm(daily.now.getTime() - parseInt(daily.dbUser.dailyTaken));

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
                daily.embed.setColor(bot.embedColors.embeds.error)
                    .setDescription(`You can claim your next daily in: **${timeLeft}**`);
                await daily.send(daily.embed);
                return;
            } else {
                daily.dbUser.dailyStreak = 0;
                daily.dbUser.save();
            }
        }

        daily.daily = daily.dailyReward + ((daily.dailyReward / 10) * daily.dbUser.dailyStreak);

        daily.dbUser.dailyTaken = message.createdTimestamp;
        User.addDaily(daily.dbUser, daily.daily);

        daily.embed.setColor(bot.embedColors.embeds.normal)
            .setDescription(`You have claimed your daily of **${daily.daily} ${bot.currencyEmoji}**\n` +
                `Your total balance now is at **${daily.dbUser.balance.toString()} ${bot.currencyEmoji}**\n` +
                `Your daily streak is at **${daily.dbUser.dailyStreak - 1} day(s)**`);

        await daily.send(daily.embed);
    }
}