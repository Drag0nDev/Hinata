exports.run = (client, message, args) => {
    message.channel.send("`" + `${Date.now() - message.createdTimestamp}` + " ms`");
}

exports.help = {
    name: 'ping'
}