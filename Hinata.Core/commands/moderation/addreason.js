const {MessageEmbed} = require('discord.js');
const { Warnings } = require('../../misc/dbObjects');
const {Permissions} = require("../../misc/tools");
const neededPerm = ['KICK_MEMBERS'];

module.exports = {
    name: 'addreason',
    aliases: ['ar'],
    category: 'moderation',
    description: 'Reset a users global xp',
    neededPermissions: neededPerm,
    usage: '[command | alias] [casenr]',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('Add reason');
        const $case = new RegExp('^[0-9]');

        if (!args[0]){
            embed.setColor(bot.embedColors.error)
                .setDescription('No arguments given')
                .setTimestamp();

            return await message.channel.send(embed);
        }

        if (!$case.exec(args[0])){
            embed.setColor(bot.embedColors.error)
                .setDescription('Please give a valid case number')
                .setTimestamp();

            return await message.channel.send(embed);
        }

        const casenr = $case.exec(args[0])[0];
        await args.shift();

        if (!args[0]){
            embed.setColor(bot.embedColors.error)
                .setDescription('Please give a reason')
                .setTimestamp();

            return await message.channel.send(embed);
        }

        const newReason = args.join(' ');

        await Warnings.findOne({
            where: {
                guildId: message.guild.id,
                casenr: casenr
            }
        }).then(warn => {
            const oldReason = warn.reason;
            warn.reason = newReason;
            warn.save();

            embed.setColor(bot.embedColors.normal)
                .setDescription('Reason changed successfully!')
                .addField('__Old reason__', oldReason, false)
                .addField('__New Reason__', newReason, false)
                .setTimestamp();
        }).catch(err => {
            embed.setColor(bot.embedColors.error)
                .setDescription(`No warning found with case number **${casenr}**!`)
                .setTimestamp();
        });

        await message.channel.send(embed);
    }
}