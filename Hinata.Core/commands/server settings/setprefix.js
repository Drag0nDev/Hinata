const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');
const {Permissions} = require('../../misc/tools');
let neededPerm = ['MANAGE_GUILD'];

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'setprefix',
    aliases: ['sp'],
    category: 'server settings',
    description: 'delete any channel in the server with a simple command',
    usage: '[command | alias] [new prefix]',
    examples: ['h!sp !'],
    neededPermissions: neededPerm,
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);
        const re = new RegExp('(remove)$');

        //check member and bot permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = Permissions.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        if (!args[0])
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a prefix!'));

        if (re.exec(args[0])) {
            await removePrefix(message, args, embed);
        } else {
            await setPrefix(message, args, embed)
        }
    }
}

async function setPrefix(message, args, embed) {
    await ServerSettings.findOne({
        where: {
            serverId: message.guild.id
        }
    }).then(server => {
        server.prefix = args[0];
        server.save();
    });

    embed.setDescription(`**${args[0]}** set as a prefix in the server!`)
        .setFooter('This prefix will be changed when you run the command again. Standard prefixes still work too!');

    await message.channel.send(embed);
}

async function removePrefix(message, args, embed) {
    await ServerSettings.findOne({
        where: {
            serverId: message.guild.id
        }
    }).then(server => {
        server.prefix = null;
        server.save();
    });

    embed.setDescription(`The prefix was removed in the server!`)
        .setTimestamp();

    await message.channel.send(embed);
}