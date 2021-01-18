const {MessageEmbed} = require("discord.js");
const {ServerUser} = require('../../misc/dbObjects');
const tools = require('../../misc/tools');
const neededPerm = ['MANAGE_GUILD'];

module.exports = {
    name: 'resetserverxp',
    aliases: ['rsx'],
    category: 'xp',
    description: 'Reset a single member or all members xp',
    usage: '[command | alias] <Member mention/id>',
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed();
        const mode = new RegExp('all');
        const id = new RegExp('[0-9]{17,}');

        //check member and bot permissions
        let noUserPermission = tools.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = tools.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        if (mode.exec(args[0])) {
            await resetAll(bot, message, embed);
        } else {
            if (!id.exec(args[0]))
                embed.setColor(bot.embedColors.error)
                    .setDescription('Please provide a valid memberid / mention');

            await resetServerUser(bot, message, id.exec(args[0])[0], embed);
        }
    }
}

async function resetAll(bot, message, embed) {
    await ServerUser.findAll({
        where: {
            guildId: message.guild.id
        }
    }).then(users => {
        users.forEach(user => {
            user.xp = 0;
            user.save();
        });

        embed.setColor(bot.embedColors.normal)
            .setTitle(`Reset server xp`)
            .setDescription(`All **${users.length}** members xp have been reset to 0xp!`)
            .setTimestamp();

        message.channel.send(embed);
    });
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