const config = {
    prefix: process.env.PREFIX,
    botId: process.env.BOTID
};

module.exports = (bot, message) => {
    if (message.author.bot) return;
    if (message.content.toLowerCase().indexOf(config.prefix.toString()) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmd = bot.commands.get(command);
    if (!cmd) return;

    console.log(`------------------------------\nCommand: '${command}'\nArguments: '${args.join(' ')}' \nUser: '${message.author.tag}' \nServer: '${message.guild.name}' \nChannel: '${message.channel.name}'`);
    cmd.run(bot, message, args);
};