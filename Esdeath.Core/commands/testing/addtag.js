module.exports = {
    name: 'addtag',
    category: 'testing',
    description: 'command to test out code',
    usage: '[command | alias]',
    neededPermissions: ['MANAGE_GUILD', 'MANAGE_CHANNELS'],
    run: async (bot, message, args) => {
        const tagName = args.shift();
        const tagDesc = args.join(' ');

        try {
            await bot.Tags.create({
                name: tagName,
                description: tagDesc,
                username: message.author.username,
            });
            return message.reply(`Tag ${tagName} added.`);
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                return message.reply('That tag already exists.');
            }
            return message.reply('Something went wrong with adding a tag.');
        }
    }
}