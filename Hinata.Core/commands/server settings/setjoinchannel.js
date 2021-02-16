const {MessageEmbed} = require('discord.js');
const {ServerSettings} = require('../../misc/dbObjects');
const {Permissions} = require('../../misc/tools');
let neededPerm = ['MANAGE_GUILD'];

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'setjoinchannel',
    aliases: ['sjc'],
    category: 'server settings',
    description: 'Set the channel where join messages are sent.\n' +
        'If this is not set and join messages is set then they won\'t be sent!\n\n' +
        'use `h!sjm remove` to disable the join messages.',
    examples: ['h!sjc', 'h!sjc #general', 'h!sjc remove'],
    neededPermissions: neededPerm,
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setTitle('Set join channel')
            .setTimestamp()
            .setColor(bot.embedColors.normal);
        const choice = new RegExp('remove|[0-9]{17,}');

        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        if (choice.test(args[0])) {
            if (choice.exec(args[0])[0] === 'remove') {
                await remove(message, embed);
            } else {
                let channel = message.guild.channels.cache.get(choice.exec(args[0])[0]);
                await addChannel(message, channel, embed);
            }
        } else {
            let channel = message.channel;
            await addChannel(message, channel, embed);
        }
    }
}

async function addChannel(message, channel, embed) {
    await ServerSettings.findOne({
        where: {
            serverId: message.guild.id
        }
    }).then(async settings => {
        settings.joinMessageChannel = channel.id;
        settings.save();

        embed.setDescription(`Join message channel set to <#${channel.id}>`);

        message.channel.send(embed);
    });
}

async function remove(message, embed) {
    await ServerSettings.findOne({
        where: {
            serverId: message.guild.id
        }
    }).then(async settings => {
        settings.joinMessageChannel = null;
        settings.save();

        embed.setDescription('Join message channel removed!\n' +
            'Join messages will no longer be sent.');

        message.channel.send(embed);
    });
}