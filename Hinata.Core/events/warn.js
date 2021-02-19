const logger = require("log4js").getLogger();

module.exports = (bot, message) => {
    logger.warn(message);
}