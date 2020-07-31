exports.run = (client, message, args) => {
    let ping = Date.now() - message.createdTimestamp + " ms";
    message.channel.send(`Pong!\n${message.createdTimestamp - Date.now()}ms`);
}

exports.help = {
    name: 'ping'
}