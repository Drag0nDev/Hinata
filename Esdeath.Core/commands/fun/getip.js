module.exports = {
    name: 'getip',
    aliases: ['gi'],
    category: 'fun',
    description: 'Get a users ip (not really)',
    usage: '[command | alias] [mention user]',
    run: (bot, message, args) => {
        if (message.mentions.members.first()) {

            let arg = args[1];
            message.channel.send('Getting ip ...').then((msg) => {
                setTimeout(function () {
                    msg.edit(`${arg}'s ip: ${getRandomInt(255)}.${getRandomInt(255)}.${getRandomInt(255)}.${getRandomInt(255)}`);
                }, 1250);
            });
        } else {
            message.channel.send('Please mention a user!');
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}