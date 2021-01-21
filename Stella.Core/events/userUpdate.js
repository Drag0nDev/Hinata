const {User} = require('../misc/dbObjects');

module.exports = async (bot, oldMember, newMember) => {
    usernameUpdate(oldMember, newMember);
}

function usernameUpdate(oldMember, newMember) {
    console.log(newMember)
    User.findOne({
        where: {
            userId: oldMember.id
        }
    }).then(dbMember => {
        dbMember.userTag = `${newMember.username}#${newMember.discriminator}`;
        dbMember.save();
    });
}