const delay = require("delay");

module.exports = {
    name: 'getip',
    aliases: ['gi'],
    category: 'fun',
    description: 'Get a users ip (not really)',
    usage: '[command | alias] [mention user]',
    run: async (bot, message, args) => {
        if (message.mentions.members.first()) {

            let arg = args[1];
            let msg = await message.channel.send('Getting ip ...');
            await delay(1250);
            await msg.edit(`${arg}'s ip: ${getRandomInt(255)}.${getRandomInt(255)}.${getRandomInt(255)}.${getRandomInt(255)}`);
        } else {
            await message.channel.send('Please mention a user!');
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}