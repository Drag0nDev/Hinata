const {MessageEmbed} = require("discord.js");
const {ServerUser} = require('../../misc/dbObjects');
const {Permissions} = require('../../misc/tools');
const neededPerm = ['MANAGE_GUILD'];

module.exports = {
    name: 'resetserverxp',
    aliases: ['rsx'],
    category: 'experience',
    description: 'Reset a single member or all members xp',
    usage: '[command | alias] <Member mention/id>',
    examples: ['s!rsx all', 's!rsx 418037700751261708', 's!rsx @Drag0n#6666'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed();
        const mode = new RegExp('all');
        const id = new RegExp('[0-9]{17,}');

        //check member and bot permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = Permissions.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        try {
            if (mode.exec(args[0])) {
                await resetAll(bot, message, embed);
            } else {
                if (!id.exec(args[0]))
                    return await message.channel.send(embed.setColor(bot.embedColors.error)
                        .setDescription('Please provide a valid memberid / mention'));

                await resetServerUser(bot, message, id.exec(args[0])[0], embed);
            }
        } catch (err) {
            await message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('No valid arguments given.'));
        }
    }
}

async function resetAll(bot, message, embed) {
    let amount;
    await ServerUser.findAll({
        where: {
            guildId: message.guild.id
        }
    }).then(users => {
        users.forEach(user => {
            user.xp = 0;
            user.save();
        });

        amount = users.length;
    });

    embed.setColor(bot.embedColors.normal)
        .setTitle(`Reset server xp`)
        .setDescription(`All **${users.length}** members xp have been reset to 0xp!`)
        .setTimestamp();

    await message.channel.send(embed);
}

async function resetServerUser(bot, message, id, embed) {
    await ServerUser.findOne({
        where: {
            userId: id
        }
    }).then(user => {
        const member = message.guild.members.cache.get(id);

        user.xp = 0;
        user.save();

        embed.setColor(bot.embedColors.normal)
            .setTitle(`Reset server xp`)
            .setDescription(`**${member.user.tag}**'s xp has been reset to 0xp!`)
            .setTimestamp();
    }).catch(err => {
        embed.setColor(bot.embedColors.error)
            .setDescription(`No user with id **${id}** found in the database`)
            .setTimestamp();
    });

    await message.channel.send(embed);
}