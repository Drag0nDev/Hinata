const {Server} = require('../../dbObjects');

module.exports = async (bot, server) => {
    await Server.destroy({
        where: {
            serverId: server.id
        }
    });
}