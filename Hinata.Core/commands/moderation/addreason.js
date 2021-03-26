const {MessageEmbed} = require('discord.js');
const { Warnings } = require('../../misc/dbObjects');
const neededPerm = ['KICK_MEMBERS'];

module.exports = {
    name: 'addreason',
    aliases: ['ar'],
    category: 'moderation',
    description: 'Reset a users global xp',
    neededPermissions: neededPerm,
    usage: '[command | alias] [casenr]',
    run: async (bot, message, args) => {
        const ar = {
            send: async (msg) => {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setTitle('Add reason'),
            reg: {
                case: new RegExp('^[0-9]')
            }
        }

        if (!args[0]){
            ar.embed.setColor(bot.embedColors.embeds.error)
                .setDescription('No arguments given')
                .setTimestamp();

            return await ar.send(ar.embed);
        }

        if (!ar.reg.case.exec(args[0])){
            ar.embed.setColor(bot.embedColors.embeds.error)
                .setDescription('Please give a valid case number')
                .setTimestamp();

            return await ar.send(ar.embed);
        }

        ar.casenr = ar.case.exec(args[0])[0];
        await args.shift();

        if (!args[0]){
            ar.embed.setColor(bot.embedColors.embeds.error)
                .setDescription('Please give a reason')
                .setTimestamp();

            return await ar.send(ar.embed);
        }

        ar.newReason = args.join(' ');

        await Warnings.findOne({
            where: {
                guildId: message.guild.id,
                casenr: ar.casenr
            }
        }).then(warn => {
            ar.oldReason = warn.reason;
            warn.reason = ar.newReason;
            warn.save();

            ar.embed.setColor(bot.embedColors.embeds.normal)
                .setDescription('Reason changed successfully!')
                .addField('__Old reason__', ar.oldReason, false)
                .addField('__New Reason__', ar.newReason, false)
                .setTimestamp();
        }).catch(err => {
            ar.embed.setColor(bot.embedColors.embeds.error)
                .setDescription(`No warning found with case number **${ar.casenr}**!`)
                .setTimestamp();
        });

        await ar.send(ar.embed);
    }
}