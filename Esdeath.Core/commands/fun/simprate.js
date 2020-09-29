module.exports = {
    name: 'simprate',
    aliases: ['howsimp'],
    category: 'fun',
    description: 'Get the simprate of a person',
    usage: '[command | alias] <user mention>',
    run: (client, message, args) => {
        if (message.mentions.members.first()) {
            let arg = args;
            message.channel.send('Calculating').then((msg) => {
                setTimeout(function () {
                    msg.edit(`${arg} is ${getRandomInt(100)}% simp!`);
                }, 1250);
            });
        } else {
            message.channel.send('counting...').then((msg) => {
                setTimeout(function () {
                    msg.edit(`${message.author} is ${getRandomInt(100)}% simp!`);
                }, 1250);
            });
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}