exports.run = (client, message, args) => {
    if(message.mentions.members.first()) {
        message.channel.send(`${args[0]} <a:bonk:735549944814895115>`)
    } else {
        message.channel.send('Please mention a user!');
    }

}

exports.help = {
    name: 'bonk'
}