const {MessageEmbed} = require('discord.js');
const {Servers, Permissions, Roles} = require('../../misc/tools');
let neededPerm = ['MANAGE_ROLES'];

module.exports = {
    //<editor-fold defaultstate="collapsed" desc="userinfo help">
    name: 'role',
    aliases: ['r'],
    category: 'roles',
    description: 'Add/remove a role on a member',
    usage: '[command | alias] [add/remove] [member mention/id] [role mention/id]',
    examples: ['h!role add @Drag0n#6666 @Member', 'h!role add 418037700751261708 762241241605210113', 'h!role remove @Drag0n#6666 762241241605210113', "h!role @Drag0n#6666 @Member"],
    neededPermissions: neededPerm,
    //</editor-fold>
    run: async (bot, message, args) => {
        const embed = new MessageEmbed().setTitle('Role');
        const action = new RegExp('add|remove');
        const id = new RegExp('[0-9]{17,}');

        //check permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        let noBotPermission = Permissions.checkBotPermissions(bot, message, neededPerm, embed);
        if (noBotPermission)
            return message.channel.send(embed);

        if (action.exec(args[0])) {
            if (action.exec(args[0])[0] === 'add') {
                await args.shift();
                await addRole(bot, message, args, embed);
            } else if (action.exec(args[0])[0] === 'remove') {
                await args.shift();
                await remRole(bot, message, args, embed);
            }
        } else {
            await addRemove(bot, message, args, embed);
        }

        await message.channel.send(embed);
    }
}

async function addRole(bot, message, args, embed) {
    let member;
    let role;

    await Servers.getMember(message, args).then(memberPromise => {
        member = memberPromise;
    });

    if (!member) {
        embed.setColor(bot.embedColors.error)
            .setDescription('No member found with this id!')
            .setTimestamp();
        return;
    }

    await args.shift();

    await Roles.getRole(message, args).then(rolePromise => {
        role = rolePromise;
    });

    if (!role) {
        embed.setColor(bot.embedColors.error)
            .setDescription('No role found with this id!')
            .setTimestamp();
        return;
    }

    //check if assigned role is higher then bots highest role
    let roleCheck = Permissions.checkRolePosition(bot, message, role);
    if (roleCheck)
        return message.channel.send(embed);

    await Roles.giveRole(member, role);

    embed.setColor(bot.embedColors.normal)
        .setDescription(`Role <@&${role.id}> added to <@!${member.user.id}>!`);
}

async function remRole(bot, message, args, embed) {
    let member;
    let role;

    await Servers.getMember(message, args).then(memberPromise => {
        member = memberPromise;
    });

    if (!member) {
        embed.setColor(bot.embedColors.error)
            .setDescription('No member found with this id!')
            .setTimestamp();
        return;
    }

    await args.shift();

    await Roles.getRole(message, args).then(rolePromise => {
        role = rolePromise;
    });

    if (!role) {
        embed.setColor(bot.embedColors.error)
            .setDescription('No role found with this id!')
            .setTimestamp();
        return;
    }

    //check if assigned role is higher then bots highest role
    let roleCheck = Permissions.checkRolePosition(bot, message, role);
    if (roleCheck)
        return message.channel.send(embed);

    await Roles.removeRole(member, role);

    embed.setColor(bot.embedColors.normal)
        .setDescription(`Role <@&${role.id}> removed from <@!${member.user.id}>!`);
}

async function addRemove(bot, message, args, embed) {
    let member;
    let role;
    let roleArray = [];

    await Servers.getMember(message, args).then(memberPromise => {
        member = memberPromise;
    });

    if (!member) {
        embed.setColor(bot.embedColors.error)
            .setDescription('No member found with this id!')
            .setTimestamp();
        return;
    }

    await args.shift();

    await Roles.getRole(message, args).then(rolePromise => {
        role = rolePromise;
    });

    if (!role) {
        embed.setColor(bot.embedColors.error)
            .setDescription('No role found with this id!')
            .setTimestamp();
        return;
    }

    if (role.managed === true) {
        embed.setColor(bot.embedColors.error)
            .setDescription('I can\'t manage this role!')
            .setTimestamp();

        return;
    }

    if (await compRoles(bot, message, member, message.guild.members.cache.get(message.author.id), role, embed))
        return;

    member._roles.forEach(roleId => {
        roleArray.push(roleId);
    });

    if (roleArray.includes(role.id)){
        await Roles.removeRole(member, role);

        embed.setColor(bot.embedColors.normal)
            .setDescription(`Role <@&${role.id}> removed from <@!${member.user.id}>!`);
    } else {
        await Roles.giveRole(member, role);

        embed.setColor(bot.embedColors.normal)
            .setDescription(`Role <@&${role.id}> added to <@!${member.user.id}>!`);
    }
}

async function compRoles(bot, message, member, author, role, embed) {
    let roleArrayAuth = [];
    let roleArrayMemb = [];
    let roleArrayBot = [];
    let botserver = message.guild.members.cache.get(bot.user.id);

    //get all the roles and their objects in an array
    author._roles.forEach(roleId => {
        roleArrayAuth.push(member.guild.roles.cache.get(roleId));
    });

    member._roles.forEach(roleId => {
        roleArrayMemb.push(member.guild.roles.cache.get(roleId));
    });

    botserver._roles.forEach(roleId => {
        roleArrayBot.push(member.guild.roles.cache.get(roleId));
    })

    roleArrayAuth.sort((a, b) => b.position - a.position);
    roleArrayMemb.sort((a, b) => b.position - a.position);
    roleArrayBot.sort((a, b) => b.position - a.position);

    if (role.position >= roleArrayBot[0].position) {
        embed.setColor(bot.embedColors.error)
            .setDescription('I can\'t assign this role due to role hierarchy!')
            .setTimestamp();

        return true;
    }

    if (role.position >= roleArrayAuth[0].position) {
        embed.setColor(bot.embedColors.error)
            .setDescription('You can\'t assign this role due to role hierarchy!')
            .setTimestamp();

        return true;
    }

    return false;
}