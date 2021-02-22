const logger = require("log4js").getLogger();

module.exports = (bot, message) => {
    if (/(Sending a heartbeat|Latency of)/i.test(message)) return null;
    logger.debug(message);
}