module.exports = {
    name: 'invite',
    aliases: ['i'],
    category: 'info',
    description: 'Invitelink for the bot',
    run: (client, message, args) => {
        message.channel.send('https://discord.com/api/oauth2/authorize?client_id=734814455833297037&permissions=2081418487&redirect_uri=https%3A%2F%2Fdiscordapp.com%2Foauth2%2Fauthorize%3F%26client_id%3D734814455833297037%26scope%3Dbot&scope=bot').catch(console.error);
    }
}