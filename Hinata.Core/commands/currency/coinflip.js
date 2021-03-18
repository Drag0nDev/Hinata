const {MessageEmbed} = require('discord.js');
const config = require('../../../config.json');
const {User} = require('../../misc/dbObjects');
const {Servers} = require('../../misc/tools');

module.exports = {
    name: 'coinflip',
    aliases: ['cf', 'flip'],
    category: 'currency',
    description: 'Guess if it will be \'heads\' or \'tails\'.\n' +
        'If you guessed right then the bet amount will be doubled.',
    usage: '[command | alias] [amount]',
    examples: ['h!cf 100'],
    cooldown: 10,
    run: async (bot, message, args) => {
        const cf = {
            send: async function (msg) {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setTitle('Coinflip')
                .setTimestamp(),
            colors: {
                win: bot.embedColors.logAdd,
                lose: bot.embedColors.logRemove,
                error: bot.embedColors.error
            },
            results: ['heads', 'tails'],
            member: message.guild.members.cache.get(message.author.id),
            amount: args[1],
            bet: args[0].toLowerCase(),
            emoji: config.currencyEmoji
        };

        if (cf.bet === 'h')
            cf.bet = 'heads';
        if (cf.bet === 't')
            cf.bet = 'tails';

        if (isNaN(parseInt(cf.amount))) {
            cf.embed.setColor(cf.colors.error)
                .setDescription('Please provide a valid gamble amount');
            return cf.send(cf.embed);
        }

        cf.amount = parseInt(cf.amount);

        cf.dbUser = await User.findOne({
            where: {
                userId: cf.member.user.id
            }
        });

        if (cf.dbUser.balance < cf.amount || cf.amount < 1) {
            cf.embed.setDescription(`You don't have enough ${cf.emoji} to do this command.\n` +
                `Your balance is **${cf.dbUser.balance} ${cf.emoji}**.`)
                .setColor(cf.colors.error);
            return cf.send(cf.embed);
        }

        cf.result = cf.results[Math.round(Math.random())];

        if (cf.result === cf.bet){
            User.add(cf.dbUser, parseInt(cf.amount));

            cf.embed.setDescription('Result')
                .addField('Bet', `${cf.amount} ${cf.emoji}`, true)
                .addField('Side', cf.result, true)
                .addField('New total', `${cf.dbUser.balance} ${cf.emoji}`, true)
                .setColor(cf.colors.win);
        } else {
            User.remove(cf.dbUser, parseInt(cf.amount));

            cf.embed.setDescription('Result')
                .addField('Bet', `${cf.amount} ${cf.emoji}`, true)
                .addField('Side', cf.result, true)
                .addField('New total', `${cf.dbUser.balance} ${cf.emoji}`, true)
                .setColor(cf.colors.lose);
        }

        await cf.send(cf.embed);
    }
}