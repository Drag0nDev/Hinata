module.exports = {
    name: 'ping',
    category: 'info',
    description: 'Show response time of the bot',
    usage: '[command | alias]',
    run: (bot, message, args) => {
        let ping = message.createdTimestamp - Date.now();
        if (ping < 0) ping *= -1;
        message.channel.send("`" + `${ping}` + " ms`");
    }
}