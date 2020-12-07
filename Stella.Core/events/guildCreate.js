const tools = require('../../tools');

module.exports = async (bot, server) => {
    for (const member of server.members.cache) {
        if (!member[1].user.bot) {
            await tools.dbAdd(member, server);
        }
    }
}