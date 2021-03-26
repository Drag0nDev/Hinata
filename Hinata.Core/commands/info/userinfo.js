const {MessageEmbed} = require('discord.js');
const {Servers, Dates, Roles} = require('../../misc/tools');

module.exports = {
    name: 'userinfo',
    aliases: ['uinfo'],
    category: 'info',
    description: 'Get the info of yourself/another person',
    usage: '[command | alias] <mention/id>',
    examples: ['h!uinfo', 'h!uinfo 418037700751261708', 'h!uinfo @Drag0n#6666'],
    cooldown: 10,
    run: async (bot, message, args) => {
        const uinfo = {
            send: async (msg) => {
                await message.channel.send(msg);
            },
            embed: new MessageEmbed().setColor(bot.embedColors.embeds.normal),
            fields: []
        };

        //find the member if one is asked if not then use the author
        uinfo.member = await Servers.getMember(message, args);

        if (!uinfo.member)
            return message.channel.send(uinfo.embed.setColor(bot.embedColors.embeds.error)
                .setDescription('Please provide a valid user ID or mention!'));

        uinfo.fields.push(
            {
                name: 'Username',
                value: `${uinfo.member.user.username}#${uinfo.member.user.discriminator}`,
                inline: true
            },
            {
                name: 'Nickname',
                value: uinfo.member.nickname === null ? '-' : uinfo.member.nickname,
                inline: true
            },
            {
                name: `Id`,
                value: uinfo.member.user.id.toString(),
                inline: true
            },
            {
                name: 'Joined server',
                value: Dates.getDate(uinfo.member.joinedTimestamp),
                inline: true
            },
            {
                name: 'Created at',
                value: Dates.getDate(uinfo.member.user.createdTimestamp),
                inline: true
            },
            {
                name: `Roles (${uinfo.member._roles.length})`,
                value: Roles.getRoles(uinfo.member),
                inline: true
            },
            {
                name: `Managing permissions`,
                value: getPermissions(uinfo.member).managePerms,
                inline: true
            },
            {
                name: `Text permissions`,
                value: getPermissions(uinfo.member).textPerms,
                inline: true
            },
            {
                name: `Voice permissions`,
                value: getPermissions(uinfo.member).voicePerms,
                inline: true
            }
        );

        uinfo.embed.setTitle(`Userinfo of: ${uinfo.member.user.username}#${uinfo.member.user.discriminator}`)
            .setThumbnail(uinfo.member.user.avatarURL({dynamic: true}))
            .addFields(uinfo.fields)
            .setFooter('Max amount of shown roles is 10!');

        await uinfo.send(uinfo.embed);
    }
}

function getPermissions(member) {
    let permissions = {
        managePerms: "",
        textPerms: "",
        voicePerms: ""
    };

    let managePerms = [];
    let textPerms = [];
    let voicePerms = [];

    //check for the managing permissions
    if (member.hasPermission(`ADMINISTRATOR`)) managePerms.push(`Administrator`);
    if (member.hasPermission(`MANAGE_GUILD`)) managePerms.push(`Manage server`);
    if (member.hasPermission(`MANAGE_ROLES`)) managePerms.push(`Manage roles`);
    if (member.hasPermission(`MANAGE_CHANNELS`)) managePerms.push(`Manage channels`);
    if (member.hasPermission(`MANAGE_WEBHOOKS`)) managePerms.push(`Manage webhooks`);
    if (member.hasPermission(`MANAGE_NICKNAMES`)) managePerms.push(`Manage nicknames`);
    if (member.hasPermission(`MANAGE_EMOJIS`)) managePerms.push(`Manage emojis`);

    //check for the text permissions
    if (member.hasPermission(`BAN_MEMBERS`)) textPerms.push(`Ban members`);
    if (member.hasPermission(`KICK_MEMBERS`)) textPerms.push(`Kick members`);
    if (member.hasPermission(`MENTION_EVERYONE`)) textPerms.push(`Mention everyone`);

    //check for the voice chat permissions
    if (member.hasPermission(`MUTE_MEMBERS`)) voicePerms.push(`Mute members`);
    if (member.hasPermission(`MOVE_MEMBERS`)) voicePerms.push(`Move members`);

    permissions.managePerms = managePerms.length > 0 ? managePerms.join('\n') : 'No manage permissions';
    permissions.textPerms = textPerms.length > 0 ? textPerms.join('\n') : 'No text permissions';
    permissions.voicePerms = voicePerms.length > 0 ? voicePerms.join('\n') : 'No voice permissions';

    return permissions;
}