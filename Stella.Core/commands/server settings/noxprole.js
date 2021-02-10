const {MessageEmbed} = require("discord.js");
const {ServerSettings} = require('../../misc/dbObjects');
const {Servers, Permissions} = require('../../misc/tools');
const neededPerm = ['MANAGE_ROLES'];

module.exports = {
    name: 'noxprole',
    aliases: ['noxp', 'nxr'],
    category: 'server settings',
    description: 'Assign a mute role or create one if no role is given',
    usage: '[command | alias] <muteroleId / muterole mention>',
    examples: ['s!muterole @Muted', 's!muterole 786901348863967242'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed();
        const roleId = new RegExp('[0-9]{17,}', 'g')
        let server;
        let noXpRole;
        await Servers.getGuild(message).then(guildProm => server = guildProm);

        //check member and bot permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        if (args[0]) {
            if (message.mentions.roles.size > 0) {
                noXpRole = message.mentions.roles.first();
            } else if (roleId.test(args[0])) {
                noXpRole = server.roles.cache.get(roleId.exec(args[0])[0]);
            }

            if (!noXpRole) {
                embed.setColor(bot.embedColors.error)
                    .setDescription('Please provide a valid role or a valid RoleId');
                return message.channel.send(embed);
            }

            //check if assigned role is higher then bots highest role
            let roleCheck = Permissions.checkRolePosition(bot, message, noXpRole, embed);
            if (roleCheck)
                return await message.channel.send(embed);


            //put muterole ID in the db
            await ServerSettings.findOne({
                where: {
                    serverId: server.id
                }
            }).then(result => {
                result.noXpRole = noXpRole.id;
                result.save();
            });
        }

        embed.setColor(bot.embedColors.normal)
            .setDescription(`muterole is set to <@&${noXpRole.id}>`);
        return message.channel.send(embed);
    }
}