const {MessageEmbed} = require('discord.js');
const {Servers, Dates, Roles} = require('../../misc/tools');

module.exports = {
    name: 'userinfo',
    aliases: ['uinfo'],
    category: 'info',
    description: 'Get the info of yourself/another person',
    usage: '[command | alias] <mention/id>',
    examples: ['s!uinfo', 's!uinfo 418037700751261708', 's!uinfo @Drag0n#6666'],
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

    //check for the managing permissions
    if (member.hasPermission(`ADMINISTRATOR`)) permissions.managePerms += `Administrator\n`;
    if (member.hasPermission(`MANAGE_GUILD`)) permissions.managePerms += `Manage server\n`;
    if (member.hasPermission(`MANAGE_ROLES`)) permissions.managePerms += `Manage roles\n`;
    if (member.hasPermission(`MANAGE_CHANNELS`)) permissions.managePerms += `Manage channels\n`;
    if (member.hasPermission(`MANAGE_WEBHOOKS`)) permissions.managePerms += `Manage webhooks\n`;
    if (member.hasPermission(`MANAGE_NICKNAMES`)) permissions.managePerms += `Manage nicknames\n`;
    if (member.hasPermission(`MANAGE_EMOJIS`)) permissions.managePerms += `Manage emojis\n`;

    //check for the text permissions
    if (member.hasPermission(`BAN_MEMBERS`)) permissions.textPerms += `Ban members\n`;
    if (member.hasPermission(`KICK_MEMBERS`)) permissions.textPerms += `Kick members\n`;
    if (member.hasPermission(`MENTION_EVERYONE`)) permissions.textPerms += `Mention everyone\n`;

    //check for the voice chat permissions
    if (member.hasPermission(`MUTE_MEMBERS`)) permissions.voicePerms += `Mute members\n`;
    if (member.hasPermission(`MOVE_MEMBERS`)) permissions.voicePerms += `Move members\n`;

    return permissions;
}