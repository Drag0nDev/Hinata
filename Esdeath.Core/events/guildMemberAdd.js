module.exports = (bot, member) => {
    let userLogs = member.guild.channels.find(c => c.name === 'member-log');

    userLogs.send(`${member.user.tag} has joined **${member.guild}**`);
};