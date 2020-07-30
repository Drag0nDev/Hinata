exports.run = (bot, message, args) => {
    bot.user.setActivity({
        name: 'test',
        type: 'ONLINE'
        //url: 'https://www.twitch.tv/zwoil'
    });
}

exports.help = {
    name: 'setActivity'
}