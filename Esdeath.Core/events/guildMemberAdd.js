module.exports = (client, member) => {
    let userLogs = member.guild.channels.find(c => c.name === 'member-logs');

    userLogs.send(`${member.user.tag} has joined **${member.guild}**`);


};