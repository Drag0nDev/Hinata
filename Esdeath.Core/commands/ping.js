exports.run = (client, message, args) => {
    let ping = message.createdTimestamp - Date.now();
    if(ping < 0) ping *= -1;
    message.channel.send("`" + `${ping}` + " ms`");
}

exports.help = {
    name: 'ping'
}