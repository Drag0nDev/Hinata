const delay = require("delay");

module.exports = {
    name: 'simprate',
    aliases: ['howsimp'],
    category: 'fun',
    description: 'Get the simprate of a person',
    usage: '[command | alias] <user mention>',
    run: async (bot, message, args) => {
        if (message.mentions.members.first()) {
            let arg = args;
            let msg = await message.channel.send('Calculating');
            await delay(1250);
            await msg.edit(`${arg} is ${getRandomInt(100)}% simp!`);
        } else {
            let msg = message.channel.send('counting...');
            await delay(1250);
            await msg.edit(`${message.author} is ${getRandomInt(100)}% simp!`);
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}