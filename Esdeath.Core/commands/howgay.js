exports.run = (client, message, args) => {
    if(message.mentions.members.first()) {
        let arg = args;
        message.channel.send('Calculating').then((msg) => {
            setTimeout(function () {
                msg.edit(`${arg} is ${getRandomInt(100)}% gay!`);
            }, 1250);
        });

    } else {
        message.channel.send('counting...').then((msg) => {
            setTimeout(function () {
                msg.edit(`${message.author} is ${getRandomInt(100)}% gay!`);
            }, 1250);
        });
    }

}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

exports.help = {
    name: 'howgay'
}