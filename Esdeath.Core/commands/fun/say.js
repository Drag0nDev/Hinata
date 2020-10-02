module.exports = {
    name: 'say',
    category: 'fun',
    description: 'Let Esdeath say something that you want',
    usage: '[command | alias] [text]',
    run: async (bot, message, args) => {
        const response = args.join(' ');
        await message.channel.send(response);
    }
}