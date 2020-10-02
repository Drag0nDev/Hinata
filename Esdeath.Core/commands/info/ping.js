module.exports = {
    name: 'ping',
    category: 'info',
    description: 'Show response time of the bot',
    usage: '[command | alias]',
    run: async (bot, message, args) => {
        let ping = message.createdTimestamp - Date.now();
        if (ping < 0) ping *= -1;
        await message.channel.send("`" + `${ping}` + " ms`");
    }
}