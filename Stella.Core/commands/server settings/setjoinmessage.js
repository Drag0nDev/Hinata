const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');
const tools = require('../../misc/tools');
let neededPerm = ['MANAGE_GUILD'];

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'setjoinmessage',
    aliases: ['sjm'],
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
    usage: '[command | alias] [new prefix]',
    examples: [
        's!sjm Welcome %mention% to **%server%**! You are the **%member%th** member.',
        's!sjm {"color": "#00ff00","title": "New member join","description": "Welcome %mention% to **%server%**!","fields": [{"name": "membercount","value": "%members%"}],"thumbnail": "%avatar%"}'
    ],
    neededPermissions: neededPerm,
    //</editor-fold>
    run: async (bot, message, args) => {
        let customMessage = args.join(' ');
        let embed = new MessageEmbed();
        let user = message.guild.members.cache.get(message.author.id);
        let guild = message.guild;

        await ServerSettings.findOne({
            where: {
                serverId: message.guild.id
            }
        }).then(async settings => {
            settings.joinMessage = customMessage;
            settings.save();

            customMessage = await tools.customReplace(guild, customMessage, user);

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
                    content: 'New server join message set to:',
                    embed: embed
                });
            } catch (err) {
                message.channel.send(`New server join message set to:\n${customMessage}`);
            }
        });
    }
}