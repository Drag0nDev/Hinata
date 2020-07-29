exports.run = (client, message, args) => {
    const response = args.join(' ');
    if ((response.toLowerCase().includes('gay') || response.toLowerCase().includes('gae'))
        && (response.toLowerCase().includes('master') || response.toLowerCase().includes('owner')))
        message.channel.send(`No u ${message.author}`);
    else
        message.channel.send(response);
}

exports.help = {
    name: 'say'
}