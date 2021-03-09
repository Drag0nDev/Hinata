const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');
const {Permissions, Levels} = require('../../misc/tools');
let neededPerm = ['MANAGE_GUILD'];

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'setleavemessage',
    aliases: ['slm'],
    category: 'server settings',
    description: 'Set a custom level up message for the server.\n' +
        'This also supports JSON format for creating embeds.\n' +
        'The different placeholders are:\n' +
        '`%avatar%` shows the avatar of the person leveling up.\n' +
        '`%user%` shows the members name and tag like (Drag0n#6666).\n' +
        '`%mention%` mentions the member who leveled up.\n' +
        '`%server%` shows the server name.' +
        '`%icon%` shows the server icon.\n' +
        '`%members%` shows the membercount of the server.',
    usage: '[command | alias] [leave message]',
    examples: [
        'h!slm **%user% left the server!',
        'h!slm {"color": "#ff0000","title": "Member left","description": "**%user%** left the server!","fields": [{"name": "membercount","value": "%members%"}],"thumbnail": "%icon%"}'
    ],
    neededPermissions: neededPerm,
    //</editor-fold>
    run: async (bot, message, args) => {
        let customMessage = args.join(' ');
        let embed = new MessageEmbed();
        let user = message.guild.members.cache.get(message.author.id);
        let guild = message.guild;

        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        await ServerSettings.findOne({
            where: {
                serverId: message.guild.id
            }
        }).then(async settings => {
            settings.leaveMessage = customMessage;
            settings.save();

            customMessage = await Levels.customReplace(guild, customMessage, user);

            try {
                const jsonEmbed = JSON.parse(customMessage.message);

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

                await message.channel.send({
                    content: 'New server join message set to:',
                    embed: embed
                });
            } catch (err) {
                message.channel.send({
                    content: `New server leave message set to:\n${customMessage}`,
                    allowedMentions: {
                        user: customMessage.user
                    }
                });
            }
        });
    }
}