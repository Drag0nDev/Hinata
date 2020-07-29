exports.run = (client, message, args) => {
    const response = args.join(' ');
    if ((response.includes('gay').toLowerCase() || response.includes('gae').toLowerCase())
        && (response.includes('master').toLowerCase() || response.includes('owner').toLowerCase()))
        message.channel.send(`No u ${message.author}`);
    else
        message.channel.send(response);
}

exports.help = {
    name: 'say'
}