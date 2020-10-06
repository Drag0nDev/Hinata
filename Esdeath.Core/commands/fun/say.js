module.exports = {
    name: 'say',
    category: 'fun',
    description: 'Let Esdeath say something that you want',
    usage: '[command | alias] [text]',
    run: async (bot, message, args) => {
        const response = args.join(' ');
        if (response.length < 1900) { //Discord limit is ~2000 chars.
        	await message.channel.send(response);
    	}
    }
}