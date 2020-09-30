const config = require("../../../config.json");

module.exports = {
    name: 'perfix',
    category: 'info',
    description: 'Get the prefix for the bot',
    usage: 'esdeath prefix',
    run: (client, message, args) => {
        message.channel.send(`My prefix is **${config.PREFIX}**.`).catch(console.error);
    }
}