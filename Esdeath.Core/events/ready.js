module.exports = bot => {
    console.log(`Logged in as ${bot.user.tag}!`);

    bot.user.setActivity({
        name: 'Under construction',
        type: 'STREAMING',
        url: 'https://www.twitch.tv/zwoil'
    });
};