const logger = require("log4js").getLogger();

module.exports = async (event, shard) => {
    logger.error(event);
}