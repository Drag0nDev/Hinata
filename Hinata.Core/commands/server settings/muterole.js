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
        const mr = {
            send: async (msg) => {
                message.channel.send(msg);
            },
            embed: new MessageEmbed(),
            server: await Servers.getGuild(message)
        };

        if (args[0]) {
            if (message.mentions.roles.size > 0) {
                mr.muteRole = message.mentions.roles.first();
            } else if (!isNaN(parseInt(args[0]))) {
                mr.muteRole = mr.server.roles.cache.get(args[0]);
            }

            if (!mr.muteRole) {
                mr.embed.setColor(bot.embedColors.embeds.error)
                    .setDescription('Please provide a valid role or a valid RoleId');
                return mr.send(mr.embed);
            }

            //check if assigned role is higher then bots highest role
            let roleCheck = Permissions.checkRolePosition(bot, message, mr.muteRole, mr.embed);
            if (roleCheck)
                return await mr.send(mr.embed);


            //put muterole ID in the db
            await ServerSettings.findOne({
                where: {
                    serverId: mr.server.id
                }
            }).then(result => {
                result.muteRoleId = mr.muteRole.id;
                result.save();
            });
        } else {
            mr.dbServer = await ServerSettings.findOne({
                where: {
                    serverId: mr.server.id
                }
            });

            if (mr.dbServer.muteRoleId !== null)
                mr.muteRole = mr.server.roles.cache.get(mr.dbServer.muteRoleId);

            if (!mr.muteRole) {
                mr.muteRole = await mr.server.roles.create({
                    data: {
                        name: 'Muted',
                        color: bot.embedColors.embeds.normal,
                        permissions: []
                    },
                    reason: 'Creation of muterole for Hinata'
                });

                await ServerSettings.findOne({
                    where: {
                        serverId: mr.server.id
                    }
                }).then(result => {
                    result.muteRoleId = mr.muteRole.id;
                    result.save();
                });

                mr.server.channels.cache.forEach(channel => {
                    channel.updateOverwrite(mr.muteRole, {
                        'SEND_MESSAGES': false,
                        'ADD_REACTIONS': false,
                        'SPEAK': false
                    });
                });

                mr.embed.setColor(bot.embedColors.embeds.normal)
                    .setDescription(`muterole created and is named <@&${mr.muteRole.id}>`);
                return mr.send(mr.embed);
            }
        }

        mr.embed.setColor(bot.embedColors.embeds.normal)
            .setDescription(`muterole is set to <@&${mr.muteRole.id}>`);
        return mr.send(mr.embed);
    }
}