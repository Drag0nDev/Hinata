const config = {
    prefix: process.env.PREFIX
};

module.exports = (bot, message) => {
    if (message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;

    console.log(`------------------------------\nCommand: '${message.content}' \nUser: '${message.author.tag}' \nServer: '${message.guild.name}' \nChannel: '${message.channel.name}'`);

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmd = bot.commands.get(command);
    if (!cmd) return;

    cmd.run(bot, message, args);
};