const {MessageEmbed} = require("discord.js");
const config = require("../../../config.json");
const {Rewards} = require('../../misc/dbObjects');
const {Permissions} = require('../../misc/tools');
const neededPerm = ['MANAGE_ROLES'];

module.exports = {
    name: 'levelupreward',
    aliases: ['lur'],
    category: 'server settings',
    description: 'Add/Remove a level up reward',
    usage: '[command | alias] [add/remove] [level] [role mention/id]',
    examples: ['h!lur add 5 @Member', 'h!lur remove 5'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('levelupreward');
        const choice = new RegExp('add|remove');

        //check member and bot permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        try {
            if (args[0].match(choice)) {
                switch (choice.exec(args[0])[0].toLowerCase()) {
                    case 'add':
                        await args.shift();
                        await add(bot, message, args, embed);
                        break;
                    case 'remove':
                        await args.shift();
                        await remove(bot, message, args, embed);
                        break;
                }
            } else {
                embed.setColor(bot.embedColors.error)
                    .setDescription('What action do you want to do?')
                    .setTimestamp();
            }
        } catch (err) {
            embed.setColor(bot.embedColors.error)
                .setDescription('Please provide valid arguments')
                .setTimestamp();
        }


        await message.channel.send(embed);
    }
}

async function add(bot, message, args, embed) {
    const role = new RegExp('[0-9]{17,}');

    try {
        if (!isNaN(parseInt(args[0]))) {
            let level = args[0];
            await args.shift();

            let xp = 0;
            let lvlXp = config.levelXp;
            let previousLvlXp = 0;

            for (let $level = level; $level > 0; $level--) {
                previousLvlXp = lvlXp + ((lvlXp / 2) * ($level - 1));
                xp += previousLvlXp;
            }

            if (role.test(args[0])) {
                let roleId = role.exec(args[0])[0];

                if (!message.guild.roles.cache.get(roleId)) {
                    embed.setColor(bot.embedColors.error)
                        .setDescription('Please provide a valid role')
                        .setTimestamp();
                    return;
                }

                await Rewards.create({
                    serverId: message.guild.id,
                    xp: xp,
                    roleId: roleId
                });

                embed.setColor(bot.embedColors.normal)
                    .setDescription(`Level up role has been set with parameters:\n` +
                        `**Level**: ${level}\n` +
                        `**Role**: <@&${roleId}>`)
                    .setTimestamp();
            } else {
                embed.setColor(bot.embedColors.error)
                    .setDescription('Please provide a valid role ID')
                    .setTimestamp();
            }
        } else {
            embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid level')
                .setTimestamp();
        }
    } catch (err) {
        console.log(err)
        embed.setColor(bot.embedColors.error)
            .setDescription('Please provide valid arguments')
            .setTimestamp();
    }

}

async function remove(bot, message, args, embed) {
    try {
        if (!isNaN(parseInt(args[0]))) {
            let level = args[0];

            let xp = 0;
            let lvlXp = config.levelXp;
            let previousLvlXp = 0;

            for (let $level = level; $level > 0; $level--) {
                previousLvlXp = lvlXp + ((lvlXp / 2) * ($level - 1));
                xp += previousLvlXp;
            }

            await Rewards.findAll({
                where: {
                    serverId: message.guild.id,
                    xp: xp
                }
            }).then(rewards => {
                embed.setColor(bot.embedColors.normal)
                    .setThumbnail(message.guild.iconURL({
                        dynamic: true
                    }))
                    .setDescription(`A total of ${rewards.length} reward(s) have been removed!`)
                    .setTimestamp();

                rewards.forEach(reward => {
                    embed.addField(`Level up role has been removed with parameters:`,
                            `**Level**: ${level}\n` +
                            `**Role**: <@&${reward.roleId}>`);
                });
            });

            await Rewards.destroy({
                where: {
                    serverId: message.guild.id,
                    xp: xp,
                }
            });
        } else {
            embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid level')
                .setTimestamp();
        }
    } catch (err) {
        embed.setColor(bot.embedColors.error)
            .setDescription('Please provide valid arguments')
            .setTimestamp();
    }
}