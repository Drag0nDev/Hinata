const {User} = require('../misc/dbObjects');
const logger = require("log4js").getLogger();

module.exports = async (bot, oldMember, newMember) => {
    usernameUpdate(oldMember, newMember);
}

function usernameUpdate(oldMember, newMember) {
    try {
        User.findOne({
            where: {
                userId: oldMember.id
            }
        }).then(dbMember => {
            dbMember.userTag = `${newMember.username}#${newMember.discriminator}`;
            dbMember.save();
        }).catch(err => {
            User.create({
                userTag: `${newMember.username}#${newMember.discriminator}`,
                userId: newMember.id
            });
        });
    } catch (err) {
        logger.error(err);
    }
}