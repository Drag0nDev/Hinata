const {MessageEmbed} = require('discord.js');
const tools = require('../../../tools');

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'userinfo',
    aliases: ['uinfo'],
    category: 'info',
    description: 'Get the info of yourself/another person',
    usage: '[command | alias] <mention/id>',
    //</editor-fold>
    run: async (bot, message, args) => {
        let embed = new MessageEmbed().setColor(bot.embedColors.normal);

        //<editor-fold defaultstate="collapsed" desc="Used variable declarations">
        //find the member if one is asked if not then use the author
        let member;

        await tools.getMember(message, args).then(memberPromise => {
            member = memberPromise;
        });

        if (!member)
            return message.channel.send(embed.setColor(bot.embedColors.error)
                .setDescription('Please provide a valid user ID or mention!'));

        //get nickname
        let nickname = member.nickname === null ? '-' : member.nickname;

        //get Join date
        let date = tools.getDate(member.joinedTimestamp);

        //get account creation date
        let creation = tools.getDate(member.user.createdTimestamp);

        //get roles
        let roles = getRoles(member);

        //get the permissions
        let permissions = getPermissions(member);
        //</editor-fold>

        //<editor-fold defaultstate="collapsed" desc="embed creation">
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
        // </editor-fold>

        await message.channel.send(embed);
    }
}

// <editor-fold defaultstate="collapsed" desc="functions of userinfo">

function getRoles(member) {
    let roleList = ``;
    let roleArray = [];
    let amount = 0;

    //get all the roles and their objects in an array
    member._roles.forEach(roleId => {
        roleArray.push(member.guild.roles.cache.get(roleId));
    });

    roleArray.sort((a, b) => b.position - a.position);

    for (let role of roleArray) {

        if (amount === 10) {
            roleList += '``...``';
            break;
        }
        roleList += `<@&${role.id}>\n`;
        amount++;
    }

    return roleList;
}

function getPermissions(member) {
    let permissions = {
        managePerms: "",
        textPerms: "",
        voicePerms: ""
    };

    let managePerms = '';
    let textPerms = '';
    let voicePerms = '';

//check for the managing permissions
    if (member.hasPermission(`ADMINISTRATOR`)) managePerms += `Administrator\n`;
    if (member.hasPermission(`MANAGE_GUILD`)) managePerms += `Manage server\n`;
    if (member.hasPermission(`MANAGE_ROLES`)) managePerms += `Manage roles\n`;
    if (member.hasPermission(`MANAGE_CHANNELS`)) managePerms += `Manage channels\n`;
    if (member.hasPermission(`MANAGE_WEBHOOKS`)) managePerms += `Manage webhooks\n`;
    if (member.hasPermission(`MANAGE_NICKNAMES`)) managePerms += `Manage nicknames\n`;
    if (member.hasPermission(`MANAGE_EMOJIS`)) managePerms += `Manage emojis\n`;

    //check for the text permissions
    if (member.hasPermission(`BAN_MEMBERS`)) textPerms += `Ban members\n`;
    if (member.hasPermission(`KICK_MEMBERS`)) textPerms += `Kick members\n`;
    if (member.hasPermission(`MENTION_EVERYONE`)) textPerms += `Mention everyone\n`;

    //check for the voice chat permissions
    if (member.hasPermission(`MUTE_MEMBERS`)) voicePerms += `Mute members\n`;
    if (member.hasPermission(`MOVE_MEMBERS`)) voicePerms += `Move members\n`;

    permissions.managePerms = managePerms !== "" ? managePerms : `No manage permissions`;
    permissions.textPerms = textPerms !== "" ? textPerms : 'No special text permissions';
    permissions.voicePerms = voicePerms !== "" ? voicePerms : 'No special voice permissions';

    return permissions;
}

// </editor-fold>