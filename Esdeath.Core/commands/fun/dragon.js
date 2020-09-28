const config = require("../../../config.json");

exports.run = (client, message, args) => {
    if(message.member.id === config.OWNER) {
        message.channel.send(`Hello master.\nYou are the best <@${config.OWNER}>!!! <:heart_diamond:738026632891334677>`);
        return;
    }

    message.channel.send('My owner is the coolest! <:heart_diamond:738026632891334677>');
}

exports.help = {
    name: 'dragon'
}