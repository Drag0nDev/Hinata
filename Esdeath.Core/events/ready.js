const logger = require("log4js").getLogger();

module.exports = async bot => {
    logger.info(`Logged in as ${bot.user.tag}!`);

    await bot.user.setActivity({
        name: 'Under construction',
        type: 'STREAMING',
        url: 'https://www.twitch.tv/zwoil'
    });
};