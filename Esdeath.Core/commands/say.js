exports.run = (client, message, args) => {
    const response = args.join(' ');
    if ((response.contains('gay').toLowerCase() || response.contains('gae').toLowerCase())
        && (response.contains('master').toLowerCase() || response.contains('owner').toLowerCase()))
        message.channel.send(`No u ${message.author}`);
    else
        message.channel.send(response);
}

exports.help = {
    name: 'say'
}