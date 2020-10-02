const logger = require("log4js").getLogger();

module.exports = bot => {
    logger.info(`Logged in as ${bot.user.tag}!`);

    bot.user.setActivity({
        name: 'Under construction',
        type: 'STREAMING',
        url: 'https://www.twitch.tv/zwoil'
    });
};