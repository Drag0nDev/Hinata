exports.run = (client, message, args) => {
    if(message.mentions.members.first()) {

        if (args[0] === '2') {
            let arg = args[1];
            message.channel.send('Getting ip ...').then((msg) => {
                setTimeout(function () {
                    msg.edit(`${arg}'s ip: ${getRandomInt(255)}.${getRandomInt(255)}.${getRandomInt(255)}.${getRandomInt(255)}`);
                }, 1250);
            });
        } else {
            let arg = args;
            message.channel.send('Getting ip ...').then((msg) => {
                setTimeout(function () {
                    msg.edit(`${arg}'s ip: 127.0.0.1`);
                }, 1250);
            });
        }
    } else {
        message.channel.send('Please mention a user!');
    }

}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

exports.help = {
    name: 'getip'
}