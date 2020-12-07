const {MessageEmbed} = require('discord.js');
const { User } = require('../../../dbObjects');
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

        if (message.author.id !== config.owner)
            return;

        User.findOne({
            where: {
                userId: args[0]
            }
        }).then(user => {
            user.xp = 0;
            user.save();

            embed.setColor(bot.embedColors.normal)
                .setDescription(`The xp of ${args[0]} has been reset successfully!`);

            message.channel.send(embed);
        });
    }
}