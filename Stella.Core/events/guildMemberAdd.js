const {User, ServerUser, ServerSettings} = require('../misc/dbObjects');
const {MessageEmbed} = require('discord.js');
const tools = require('../misc/tools');

module.exports = async (bot, member) => {
    await addDb(member);
    await sendWelcomeMessage(member)
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

    await ServerSettings.findOne({
        where: {
            serverId: guild.id
        }
    }).then(async settings => {
        if (!settings.joinMessageChannel || !settings.joinMessage) return;

        let joinMessage = settings.joinMessage;
        let joinChannel = guild.channels.cache.get(settings.joinMessageChannel);

        joinMessage = await tools.customReplace(guild, joinMessage, member);

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
            joinChannel.send(joinMessage);
        }
    })
}