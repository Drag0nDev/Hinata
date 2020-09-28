exports.run = (bot, message, args) => {
    if(message.mentions.members.first()) {
        let arg = args;
        message.channel.send('looking').then((msg) => {
            setTimeout(function () {
                msg.edit(`${arg}'s pp:\n8${lenght()}D`);
            }, 1250);
        });

    } else {
        message.channel.send('looking').then((msg) => {
            setTimeout(function () {
                msg.edit(`${message.author}'s pp:\n8${lenght()}D`);
            }, 1250);
        });
    }
}

function lenght() {
    let length = '';
    for(let i = 0; i < getRandomInt(1000)  % 20; i++){
        length += '=';
    }
    return length;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

exports.help = {
    name: 'pp'
}