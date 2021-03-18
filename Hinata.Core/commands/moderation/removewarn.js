const neededPerm = ['MANAGE_GUILD'];
const {MessageEmbed} = require("discord.js");
const {Warnings, User} = require('../../misc/dbObjects');
const {Permissions, Servers} = require('../../misc/tools');
const logger = require("log4js").getLogger();

module.exports = {
    name: 'removewarn',
    aliases: ['rw'],
    category: 'moderation',
    description: 'This command removes the warnings depending on the input.',
    usage: '[command | alias] [Member mention/id] <reason>',
    examples: ['h!rw all', 'h!rw @Drag0n#6666 69', 'h!rw @Drag0n#6666 all'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('Remove warn');
        const choice = new RegExp('all|[0-9]{17,}');
        const memberChoice = new RegExp('all|^[0-9]+');
        const id = new RegExp('[0-9]{17,}');

        if (choice.test(args[0])){
            embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid argument!')
                .setTimestamp();

            return  message.channel.send(embed);
        }

        if (choice.exec(args[0])[0] === 'all') {
            await removeAll(bot, message, embed);
        } else if (parseInt(choice.exec(args[0])[0])) {
            let member;

            await Servers.getMember(message, args).then(memberPromise => {
                member = memberPromise.user.id;
            });

            await args.shift()

            if (memberChoice.exec(args[0])[0] === 'all') {
                await removeMemberAll(bot, message, member, embed);
            } else if (parseInt(memberChoice.exec(args)[0])) {
                await removeOne(bot, message, member, memberChoice.exec(args[0])[0], embed);
            } else {
                embed.setColor(bot.embedColors.error)
                    .setDescription('Please provide a valid argument!')
                    .setTimestamp();
            }
        } else {
            embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid argument!')
                .setTimestamp();
        }

        await message.channel.send(embed);
    }
}

async function removeAll(bot, message, embed) {
    await Warnings.findAll({
            where: {
                guildId: message.guild.id
            }
        }
    ).then(warnings => {
        warnings.forEach(warning => {
            warning.destroy();
        });
    }).catch(err => {
        logger.error(err);
        embed.setColor(bot.embedColors.error)
            .setDescription(`Please contact the bot developer to resolve the error that occured\n` +
                `error: **${err}**`)
            .setTimestamp();
    });

    embed.setColor(bot.embedColors.normal)
        .setDescription(`All warnings for server **${message.guild.name}** successfully removed!`)
        .setTimestamp();
}

async function removeMemberAll(bot, message, memberId, embed) {
    await Warnings.findAll({
            where: {
                guildId: message.guild.id,
                userId: memberId
            }
        }
    ).then(async warnings => {
        warnings.forEach(warning => {
            warning.destroy();
        });

        await User.findOne({
            where: {
                userId: memberId
            }
        }).then(user => {
            embed.setColor(bot.embedColors.normal)
                .setDescription(`All warnings for user **${user.userTag}** successfully removed!`)
                .setTimestamp();
        });
    }).catch(err => {
        logger.error(err);
        embed.setColor(bot.embedColors.error)
            .setDescription(`Please contact the bot developer to resolve the error that occured\n` +
                `error: **${err}**`)
            .setTimestamp();
    });
}

async function removeOne (bot, message, memberId, casenr, embed) {
    await Warnings.findOne({
        where: {
            guildId: message.guild.id,
            userId: memberId,
            casenr: casenr
        }
    }).then(async warning => {
        warning.destroy();

        await User.findOne({
            where: {
                userId: memberId
            }
        }).then(user => {
            embed.setColor(bot.embedColors.normal)
                .setDescription(`Warnings for user **${user.userTag}** successfully removed!`)
                .setTimestamp();
        });

        await Warnings.findAll({
                where: {
                    guildId: message.guild.id
                }
            }
        ).then(async warnings => {
            warnings.forEach(warn => {
                if (warn.casenr > casenr) {
                    warn.casenr -= 1;
                    warn.save();
                }
            });
        });
    }).catch(err => {
        logger.error(err);
        embed.setColor(bot.embedColors.error)
            .setDescription(`Please contact the bot developer to resolve the error that occured\n` +
                `error: **${err}**`)
            .setTimestamp();
    });
}