const {User} = require('../misc/dbObjects');

module.exports = async (bot, oldMember, newMember) => {
    usernameUpdate(oldMember, newMember);
}

function usernameUpdate(oldMember, newMember) {
    User.findOne({
        where: {
            userId: oldMember.id
        }
    }).then(dbMember => {
        dbMember.userTag = `${newMember.tag}`;
        dbMember.save();
    });
}