exports.run = async (client, message, args) => {
    client.emit('guildMemberAdd', message.member)
};

exports.help = {
    name: 'newmember'
}