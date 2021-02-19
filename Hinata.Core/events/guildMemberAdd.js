const {User, ServerUser, ServerSettings} = require('../misc/dbObjects');
const {MessageEmbed} = require('discord.js');
const {Logs, Levels} = require('../misc/tools');
const logger = require("log4js").getLogger();
const pm = require('pretty-ms');

module.exports = async (bot, member) => {
    try {
        await addDb(member);
        await sendWelcomeMessage(member);
        await joinleaveLog(bot, member);
    } catch (err) {
        logger.error(err);
    }
}

async function addDb(member) {
    if (!member.bot) {
        await ServerUser.findOrCreate({
            where: {
                userId: member.user.id,
                guildId: member.guild.id
            }
        });
        await User.findOrCreate({
            where: {
                userId: member.user.id
            },
            defaults: {
                userTag: `${member.user.username}#${member.user.discriminator}`
            }
        })
    }
}

async function sendWelcomeMessage(member) {
    const guild = member.guild;
    let settings;

    settings = await ServerSettings.findOne({
        where: {
            serverId: guild.id
        }
    });

    if (!settings.joinMessageChannel || !settings.joinMessage) return;

    let joinMessage = settings.joinMessage;
    let joinChannel = guild.channels.cache.get(settings.joinMessageChannel);

    joinMessage = await Levels.customReplace(guild, joinMessage, member);

    try {
        let embed = new MessageEmbed();
        const jsonEmbed = JSON.parse(joinMessage);

        if (jsonEmbed.color) embed.setColor(jsonEmbed.color);
        if (jsonEmbed.title) embed.setTitle(jsonEmbed.title);
        if (jsonEmbed.description) embed.setDescription(jsonEmbed.description);
        if (jsonEmbed.thumbnail) embed.setThumbnail(jsonEmbed.thumbnail);
        if (jsonEmbed.fields) {
            for (let field of jsonEmbed.fields) {
                let name = field.name;
                let value = field.value;
                let inline;
                if (field.inline) inline = field.inline;
                else inline = false;

                embed.addField(name, value, inline);
            }
        }

        await joinChannel.send({embed: embed});
    } catch (err) {
        await joinChannel.send(joinMessage);
    }
}

async function joinleaveLog(bot, member) {
    const date = new Date();
    const creation = member.user.createdTimestamp;
    let age = date.getTime() - creation;

    let agestr = pm(age, {
        verbose: true,
    });

    let embed = new MessageEmbed().setTitle('Member joined')
        .setTimestamp()
        .setColor(bot.embedColors.join)
        .setAuthor(`${member.user.username}#${member.user.discriminator}`, member.user.avatarURL({dynamic: true}), member.user.avatarURL({dynamic: true, size: 4096}))
        .setDescription(`<@!${member.user.id}> joined the server`)
        .addField(`Membercount`, member.guild.memberCount, true)
        .addField('Account age', agestr, true)
        .setFooter(`ID: ${member.user.id}`);

    await Logs.joinLeaveLog(member, embed);
}