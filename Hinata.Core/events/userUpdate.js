const {User} = require('../misc/dbObjects');
const logger = require("log4js").getLogger();
const {MessageEmbed} = require('discord.js');
const {Logs} = require("../misc/tools");

module.exports = async (bot, oldMember, newMember) => {
    //update the name in the database
    try {
        await User.findOne({
            where: {
                userId: oldMember.id
            }
        }).then(dbMember => {
            dbMember.userTag = `${newMember.username}#${newMember.discriminator}`;
            dbMember.save();
        }).catch(err => {
            User.create({
                userTag: `${newMember.username}#${newMember.discriminator}`,
                userId: newMember.id
            });
        });

        await bot.guilds.cache.forEach(guild => {
            if (!guild.me.hasPermission('MANAGE_WEBHOOKS'))
                if (guild.members.cache.get(newMember.id)) {
                    //post logs if the username updated
                    if (oldMember.username !== newMember.username) {
                        let embed = new MessageEmbed().setTimestamp()
                            .setColor(bot.embedColors.logs.logChange)
                            .setAuthor(`${newMember.username}#${newMember.discriminator}`,
                                newMember.avatarURL({dynamic: true}),
                                newMember.avatarURL({dynamic: true, size: 4096}))
                            .setTitle('Username changed')
                            .addField('Old username', oldMember.username)
                            .addField('New username', newMember.username)
                            .setFooter(`ID: ${newMember.id}`);

                        Logs.memberLogGuild(bot, guild, embed);
                    }
                    //post logs if the discriminator updated
                    if (oldMember.discriminator !== newMember.discriminator) {
                        let embed = new MessageEmbed().setTimestamp()
                            .setColor(bot.embedColors.logs.logChange)
                            .setAuthor(`${newMember.username}#${newMember.discriminator}`,
                                newMember.avatarURL({dynamic: true}),
                                newMember.avatarURL({dynamic: true, size: 4096}))
                            .setTitle('Discriminator changed')
                            .addField('Old discriminator', oldMember.discriminator)
                            .addField('New discriminator', newMember.discriminator)
                            .setFooter(`ID: ${newMember.id}`);

                        Logs.memberLogGuild(bot, guild, embed);
                    }
                    //post logs if the avatar updated
                    if (oldMember.avatar !== newMember.avatar) {
                        let embed = new MessageEmbed().setTimestamp()
                            .setColor(bot.embedColors.logs.logChange)
                            .setAuthor(`${newMember.username}#${newMember.discriminator}`,
                                newMember.avatarURL({dynamic: true}),

                                newMember.avatarURL({dynamic: true, size: 4096}))
                            .setTitle('Avatar changed')
                            .setImage(newMember.avatarURL({
                                dynamic: true,
                                size: 4096
                            }))
                            .setFooter(`ID: ${newMember.id}`);

                        Logs.memberLogGuild(bot, guild, embed);
                    }
                }
        });
    } catch (err) {
        logger.error(err);
    }
}