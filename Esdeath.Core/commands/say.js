exports.run = (client, message, args) => {
    const response = args.join(' ');
    if (response === 'my creator is big gay' || response === 'my creator is gay')
        message.channel.send(`No u ${message.author}`);
    else
        message.channel.send(response);
}

exports.help = {
    name: 'say'
}