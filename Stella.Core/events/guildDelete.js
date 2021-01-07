const {Server} = require('../misc/dbObjects');

module.exports = async (bot, server) => {
    await Server.destroy({
        where: {
            serverId: server.id
        }
    });
}