const Sequelize = require('sequelize');
const config = require('../../config.json');
const logger = require("log4js").getLogger();

const sequelize = new Sequelize('database', config.username, config.password, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'StellaDb.sqlite',
});

const User = require('../Database/dbObjects/User')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/Server')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/ServerUser')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/Timers')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/Warnings')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');