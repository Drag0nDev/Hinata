module.exports = {
    name: 'say',
    category: 'fun',
    description: 'Let Esdeath say something that you want',
    usage: '[command | alias] [text]',
    examples: ['h!say Hello world'],
    run: async (bot, message, args) => {
        let response = args.join(' ');
        let userMentions = [];
        let roleMentions = [];

        if (response.length < 1900) { //Discord limit is ~2000 chars.
            message.mentions.users.forEach(user => {
                userMentions.push(user.id);
            });

            message.mentions.roles.forEach(role => {
                roleMentions.push(role.id);
            });

        	await message.channel.send({
                content: response,
                allowedMentions: {
                    users: userMentions,
                    roles: roleMentions
                }
            });
    	}
    }
}