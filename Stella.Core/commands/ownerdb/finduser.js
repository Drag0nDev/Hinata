const {MessageEmbed} = require('discord.js');
const {User, ServerUser} = require('../../misc/dbObjects');
const config = require("../../../config.json");
const {Permissions} = require('../../misc/tools');

module.exports = {
    name: 'finduser',
    aliases: ['fu', 'getuser'],
    category: 'ownerdb',
    description: 'Find info about a user',
    usage: '[command | alias] <id/mention>',
    run: async (bot, message, args) => {
        let embed = new MessageEmbed()
        let guild;

        if (message.author.id !== config.owner) {
            Permissions.ownerOnly(bot, message.channel)
            return;
        }

        if (!args[0]) {
            embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid memberid / mention');

            return message.channel.send(embed);
        }

        embed.setColor(bot.embedColors.normal)
            .setDescription(`Getting the info of user with id **${args[0]}**`);

        await ServerUser.findAll({
            where: {
                userId: args[0]
            }
        }).then(async servers => {
            const serverId = servers[0].guildId;
            guild = await bot.guilds.cache.get(serverId);
        });

        const userB = await guild.members.fetch({user: args[0], force: true});

        await message.channel.send(embed).then(async message => {
            let edit = new MessageEmbed().setColor(bot.embedColors.normal);
            let mutual = 0;

            await bot.guilds.cache.forEach(guild => {
                if (guild.members.cache.get(userB.user.id))
                    mutual++
            });

            if (userB) {
                edit.addField(`Name`, `${userB.user.username}#${userB.user.discriminator}`, true)
                    .addField(`Id`, userB.user.id, true)
                    .addField('Mutual servers', mutual, true)
                    .setImage(userB.user.avatarURL({
                        dynamic: true,
                        size: 4096
                    }));
            } else {
                edit.setDescription(`I could not find the user with id: **${args[0]}** in my cache.`);
            }

            await User.findOne({
                where: {
                    userId: userB.user.id
                }
            }).then(user => {
                edit.addField('Currency', `${user.balance} ${bot.currencyEmoji}`, true)
                    .addField('Global level', user.level, true)
                    .addField('Global xp', user.xp, true);
            });

            await message.edit(edit);
        });
    }
}