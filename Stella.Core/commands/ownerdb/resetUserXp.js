const {MessageEmbed} = require('discord.js');
const { User } = require('../../misc/dbObjects');
const Sequelize = require('sequelize');
const pm = require('parse-ms');
const config = require("../../../config.json");

module.exports = {
    name: 'resetuserxp',
    aliases: ['ruxp'],
    category: 'ownerdb',
    description: 'Reset a users global xp',
    usage: '[command | alias] <id>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed();
        const id = new RegExp('[0-9]{17,}');

        if (message.author.id !== config.owner)
            return;

        if (!id.exec(args[0]))
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid memberid / mention'));

        User.findOne({
            where: {
                userId: id.exec(args[0])[0]
            }
        }).then(user => {
            user.xp = 0;
            user.level = 0;
            user.save();

            embed.setColor(bot.embedColors.normal)
                .setDescription(`The xp of ${args[0]} has been reset successfully!`);
        }).catch(err => {
            embed.setColor(bot.embedColors.error)
                .setDescription(`No user with id **${args[0]}** found in the database`)
                .setTimestamp();
        });

        await message.channel.send(embed);
    }
}