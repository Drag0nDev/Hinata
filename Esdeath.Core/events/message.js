const config = require("../../config.json");
const logger = require("log4js").getLogger();

module.exports = (bot, message) => {
    if (message.author.bot) return;
    if (message.content.toLowerCase().indexOf(config.PREFIX) !== 0) return;

    const args = message.content.slice(config.PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    let cmd = bot.commands.get(command);
    if (!cmd) cmd = bot.commands.get(bot.aliases.get(command));

    let logging = `------------------------------\nCommand: '${cmd.name}'\nArguments: '${args.join(' ')}' \nUser: '${message.author.tag}' \nServer: '${message.guild.name}' \nChannel: '${message.channel.name}'`
    logger.info(logging);

    if(cmd){
        cmd.run(bot, message, args);
    }
};