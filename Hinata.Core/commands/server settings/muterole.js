const {MessageEmbed} = require("discord.js");
const {ServerSettings} = require('../../misc/dbObjects');
const {Permissions, Servers} = require('../../misc/tools');
const neededPerm = ['MANAGE_ROLES'];

module.exports = {
    name: 'muterole',
    category: 'server settings',
    description: 'Assign a mute role or create one if no role is given',
    usage: '[command | alias] <muteroleId / muterole mention>',
    examples: ['h!muterole @Muted', 'h!muterole 786901348863967242'],
    neededPermissions: neededPerm,
    run: async (bot, message, args) => {
        let embed = new MessageEmbed();
        let server;
        let muteRole;
        let dbServer;
        await Servers.getGuild(message).then(guildProm => server = guildProm);

        //check member and bot permissions
        let noUserPermission = Permissions.checkUserPermissions(bot, message, neededPerm, embed);
        if (noUserPermission)
            return await message.channel.send(embed);

        if (args[0]) {
            if (message.mentions.roles.size > 0) {
                muteRole = message.mentions.roles.first();
            } else if (!isNaN(parseInt(args[0]))) {
                muteRole = server.roles.cache.get(args[0]);
            }

            if (!muteRole) {
                embed.setColor(bot.embedColors.error)
                    .setDescription('Please provide a valid role or a valid RoleId');
                return message.channel.send(embed);
            }
            
            //check if assigned role is higher then bots highest role
            let roleCheck = Permissions.checkRolePosition(bot, message, muteRole, embed);
            if (roleCheck)
                return await message.channel.send(embed);


            //put muterole ID in the db
            await ServerSettings.findOne({
                where: {
                    serverId: server.id
                }
            }).then(result => {
                result.muteRoleId = muteRole.id;
                result.save();
            });
        } else {
            dbServer = await ServerSettings.findOne({
                where: {
                    serverId: server.id
                }
            });

            if (dbServer.muteRoleId !== null)
                muteRole = server.roles.cache.get(dbServer.muteRoleId);

            if (!muteRole) {
                await server.roles.create({
                    data: {
                        name: 'Muted',
                        color: bot.embedColors.normal,
                        permissions: []
                    },
                    reason: 'Creation of muterole for Hinata'
                }).then(role => {
                    muteRole = role;
                });

                await ServerSettings.findOne({
                    where: {
                        serverId: server.id
                    }
                }).then(result => {
                    result.muteRoleId = muteRole.id;
                    result.save();
                });

                server.channels.cache.forEach(channel => {
                    channel.updateOverwrite(muteRole , {
                        'SEND_MESSAGES': false,
                        'ADD_REACTIONS': false,
                        'SPEAK': false
                    });
                });

                embed.setColor(bot.embedColors.normal)
                    .setDescription(`muterole created and is named <@&${muteRole.id}>`);
                return message.channel.send(embed);
            }
        }

        embed.setColor(bot.embedColors.normal)
            .setDescription(`muterole is set to <@&${muteRole.id}>`);
        return message.channel.send(embed);
    }
}