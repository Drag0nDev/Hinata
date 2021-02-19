const {Server, Rewards, ServerSettings, Timers, ServerUser, Warnings} = require('../misc/dbObjects');

module.exports = async (bot, server) => {
    await Server.destroy({
        where: {
            serverId: server.id
        }
    });

    await Rewards.destroy({
        where: {
            serverId: server.id
        }
    });

    await ServerUser.destroy({
        where: {
            guildId: server.id
        }
    });

    await ServerSettings.destroy({
        where: {
            serverId: server.id
        }
    });

    await Warnings.destroy({
        where: {
            guildId: server.id
        }
    });

    await Timers.destroy({
        where: {
            guildId: server.id
        }
    });
}