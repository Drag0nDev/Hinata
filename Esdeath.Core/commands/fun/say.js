exports.run = (client, message, args) => {
    const response = args.join(' ');
    message.channel.send(response);
}

exports.help = {
    name: 'say'
}