const config = require("../../../config.json");

module.exports = {
    name: 'bonk',
    category: 'fun',
    description: 'Bonk a user',
    usage: '[command | alias] [mention user]',
    run: (client, message, args) => {
        if (message.mentions.members.first()) {
            console.log(args[0]);
            if (args[0] === `<@!${config.OWNER}>`) {
                message.channel.send(`${message.author} <a:bonk:735549944814895115>, don't bonk my master!`);
            } else {
                message.channel.send(`${args[0]} <a:bonk:735549944814895115>`);
            }
        } else {
            message.channel.send('Please mention a user!');
        }
    }
}