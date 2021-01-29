const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');
const tools = require('../../misc/tools');
let neededPerm = ['MANAGE_GUILD'];

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'setleveluprolemessage',
    aliases: ['slurm'],
    category: 'server settings',
    description: 'Set a custom level up message for the server when the level up also grants a role.\n' +
        'This also supports JSON format for creating embeds.\n' +
        'The different placeholders are:\n' +
        '`%avatar%` shows the avatar of the person leveling up.\n' +
        '`%user%` shows the members name and tag like (Drag0n#6666).\n' +
        '`%mention%` mentions the member who leveled up.\n' +
        '`%server%` shows the server name.' +
        '`%role%` shows the gained role' +
        '`%icon%` shows the server icon.\n' +
        '`%level% shows the new level they reached.`\n\n' +
        'Examples:\n' +
        'Normal message:\n' +
        '`s!slum Congratulations %mention% you just advanced to **%level%**!`\n' +
        'Embed message:\n' +
        '`s!slum {"color": "BE4F70","title": "Level up","description": "Congratulations %mention% you just leveled up","fields": [{"name": "New level","value": "%level%", "inline": true},{"name": "New role","value": "%role%"}],"thumbnail": "%avatar%"}`',
    usage: '[command | alias] [new prefix]',
    neededPermissions: neededPerm,
    //</editor-fold>
    run: async (bot, message, args) => {
        let customMessage = args.join(' ');
        let embed = new MessageEmbed();
        let newLevel = 5;
        let newRoleId = message.guild.roles.cache.firstKey();
        let user = message.guild.members.cache.get(message.author.id);

        await ServerSettings.findOne({
            where: {
                serverId: message.guild.id
            }
        }).then(async settings => {
            settings.levelUpRoleMessage = customMessage;
            settings.save();

            customMessage = await tools.customReplace(message, customMessage, user, newLevel, newRoleId);

            try {
                const jsonEmbed = JSON.parse(customMessage);

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
                    content: 'New server level up message set to:',
                    embed: embed
                });
            } catch (err) {
                message.channel.send(`New server level up role message set to:\n${customMessage}`);
            }
        });
    }
}