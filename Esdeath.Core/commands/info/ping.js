module.exports = {
    name: 'ping',
    category: 'info',
    description: 'Show response time of the bot',
    usage: '[command | alias]',
    run: async (bot, message, args) => {
        let ping = Date.now() - message.createdTimestamp; //As date received is ALWAYS smaller than date created, this should be more correct, than message - now().
        if (ping < 0) ping *= -1; //Should be obsolete
        await message.channel.send("Bot ping: `" + `${ping}` + " ms`"); //Formatted it a bit better
    }
}