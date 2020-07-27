exports.run = async (bot, message, args) => {
    client.emit('guildMemberAdd', message.member)
};

exports.help = {
    name: 'newmember'
}