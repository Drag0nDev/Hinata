const config = require("../../config.json");
const fs = require('fs');

module.exports = (bot, message) => {
    let date = new Date();
    if (message.author.bot) return;
    if (message.content.toLowerCase().indexOf(config.PREFIX) !== 0) return;

    const args = message.content.slice(config.PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmd = bot.commands.get(command);
    if (!cmd) return;

    var logging = `------------------------------\nCommand: '${command}'\nArguments: '${args.join(' ')}' \nUser: '${message.author.tag}' \nServer: '${message.guild.name}' \nChannel: '${message.channel.name}'`

    fs.appendFile(`./logs/esdeathlog-${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.txt`, `${logging}\n`, function (err) {
        if (err) throw err;
        else {
            console.log(logging);
        }
    });

    cmd.run(bot, message, args);
};