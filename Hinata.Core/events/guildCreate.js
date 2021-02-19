const {Minor} = require('../misc/tools');

module.exports = async (bot, server) => {
    for (const member of server.members.cache) {
        if (!member[1].user.bot) {
            await Minor.dbAdd(member, server);
        }
    }
}