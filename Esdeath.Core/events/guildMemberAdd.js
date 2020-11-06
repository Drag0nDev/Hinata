const {User, ServerUser} = require('../../dbObjects');

module.exports = async (bot, member) => {
    if (!member.bot) {
        await ServerUser.findOrCreate({
            where: {
                userId: member.user.id,
                guildId: member.guild.id
            }
        });
        await User.findOrCreate({
            where: {
                userId: member.user.id
            },
            defaults: {
                userTag: `${member.user.username}#${member.user.discriminator}`
            }
        })
    }
}