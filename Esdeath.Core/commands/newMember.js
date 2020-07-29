exports.run = async (bot, message, args) => {
    bot.emit('guildMemberAdd', message.member)
};

exports.help = {
    name: 'newmember'
}