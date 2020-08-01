exports.run = (client, message, args) => {
    message.channel.send("`" + `${message.createdTimestamp - Date.now()}` + " ms`");
}

exports.help = {
    name: 'ping'
}