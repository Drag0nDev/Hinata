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
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);

        //find the member if one is asked if not then use the author
        let member;

        await Servers.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        if (!member)
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid user ID or mention!'));

        //get nickname
        let nickname = member.nickname === null ? '-' : member.nickname;

        //get Join date
        let date = Dates.getDate(member.joinedTimestamp);

        //get account creation date
        let creation = Dates.getDate(member.user.createdTimestamp);

        //get roles
        let roles = Roles.getRoles(member);

        //get the permissions
        let permissions = getPermissions(member);

        embed.setTitle(`Userinfo of: ${member.user.username}#${member.user.discriminator}`)
            .setThumbnail(member.user.avatarURL({dynamic: true}))
            .addFields(
                {name: 'Username', value: `${member.user.username}#${member.user.discriminator}`, inline: true},
                {name: 'Nickname', value: `${nickname}`, inline: true},
                {name: `Id`, value: `${member.user.id}`, inline: true},
                {name: 'Joined server', value: `${date}`, inline: true},
                {name: 'Created at', value: `${creation}`, inline: true},
                {name: `Roles (${member._roles.length})`, value: `${roles}`, inline: true},
                {name: `Managing permissions`, value: `${permissions.managePerms}`, inline: true},
                {name: `Text permissions`, value: `${permissions.textPerms}`, inline: true},
                {name: `Voice permissions`, value: `${permissions.voicePerms}`, inline: true},
            )
            .setFooter('Max amount of shown roles is 10!');

        await message.channel.send(embed);
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