const {User, ServerUser, Server} = require('../../dbObjects');

module.exports = async (bot, server) => {
    for (const member of server.members.cache) {
        if (!member[1].user.bot) {
            await ServerUser.findOrCreate({
                where: {
                    userId: member[1].user.id,
                    guildId: member[1].guild.id
                }
            });
            await User.findOrCreate({
                where: {
                    userId: member[1].user.id
                },
                defaults: {
                    userTag: `${member[1].user.username}#${member[1].user.discriminator}`
                }
            });
            await Server.findOrCreate({
                where: {
                    serverId: server.id
                },
                defaults: {
                    serverName: server.name
                }
            });
        }
    }
}