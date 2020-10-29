const config = require("../../config.json");
const logger = require("log4js").getLogger();

module.exports = async (bot, message) => {

    if (config.testing && message.author.id !== config.owner) return;
    if (message.author.bot) return;
    if (message.content.toLowerCase().indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    let cmd = bot.commands.get(command);
    if (!cmd) cmd = bot.commands.get(bot.aliases.get(command));

    if (cmd) {
        try {
            let logging = `------------------------------\n` +
                `Command: '${cmd.name}'\n` +
                `Arguments: '${args.join(' ')}'\n` +
                `User: '${message.author.tag}'\n` +
                `Server: '${message.guild.name}'\n` +
                `Guild ID: '${message.guild.id}'\n` +
                `Channel: '${message.channel.name}'`;

            logger.info(logging);
            await cmd.run(bot, message, args);
        } catch (err) {
            logger.error(err)
        }
    }
};