module.exports = {
    name: 'say',
    aliases: [],
    category: 'fun',
    description: 'Let Esdeath say something that you want',
    usage: '[command | alias] [text]',
    run: (client, message, args) => {
        const response = args.join(' ');
        message.channel.send(response);
    }
}