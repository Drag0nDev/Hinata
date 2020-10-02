const config = require("../../../config.json");

module.exports = {
    name: 'setname',
    aliases: ['changename'],
    category: 'owner',
    description: 'Change esdeaths displayname',
    usage: '[command | alias] [new name]',
    run: async (bot, message, args) => {
        if (message.member.id === config.OWNER) {
            const newName = args.join(' ');
            await bot.user.setUsername(newName);
            await message.channel.send('Username changed successfully!');
        } else {
            await message.channel.send(`${message.author} this is a command only for my creator!`);
        }
    }
}