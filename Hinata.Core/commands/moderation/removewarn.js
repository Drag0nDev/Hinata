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
        const rm = {
            send: async (msg) => {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setTitle('Remove warn'),
            regs: {
                choice: new RegExp('all|[0-9]{17,}'),
                memberChoice: new RegExp('all|^[0-9]+'),
            }
        }

        if (rm.regs.choice.test(args[0])){
            await rm.embed.setColor(bot.embedColors.embeds.error)
                .setDescription('Please provide a valid argument!')
                .setTimestamp();

            return  rm.send(rm.embed);
        }

        if (rm.regs.choice.exec(args[0])[0] === 'all') {
            await removeAll(bot, message, embed);
        } else if (parseInt(rm.regs.choice.exec(args[0])[0])) {
            rm.member = await Servers.getMember(message, args).user.id;

            await args.shift()

            if (rm.regs.memberChoice.exec(args[0])[0] === 'all') {
                await removeMemberAll(bot, message, rm.member, rm.embed);
            } else if (parseInt(rm.regs.memberChoice.exec(args)[0])) {
                await removeOne(bot, message, rm.member, rm.regs.memberChoice.exec(args[0])[0], rm.embed);
            } else {
                await rm.embed.setColor(bot.embedColors.embeds.error)
                    .setDescription('Please provide a valid argument!')
                    .setTimestamp();
            }
        } else {
            await rm.embed.setColor(bot.embedColors.embeds.error)
                .setDescription('Please provide a valid argument!')
                .setTimestamp();
        }

        await rm.send(rm.embed);
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
        embed.setColor(bot.embedColors.embeds.error)
            .setDescription(`Please contact the bot developer to resolve the error that occured\n` +
                `error: **${err}**`)
            .setTimestamp();
    });

    await embed.setColor(bot.embedColors.embeds.normal)
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
            embed.setColor(bot.embedColors.embeds.normal)
                .setDescription(`All warnings for user **${user.userTag}** successfully removed!`)
                .setTimestamp();
        });
    }).catch(err => {
        logger.error(err);
        embed.setColor(bot.embedColors.embeds.error)
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
            embed.setColor(bot.embedColors.embeds.normal)
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
        embed.setColor(bot.embedColors.embeds.error)
            .setDescription(`Please contact the bot developer to resolve the error that occured\n` +
                `error: **${err}**`)
            .setTimestamp();
    });
}