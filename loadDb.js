const Sequelize = require('sequelize');
const config = require('./config.json');
const logger = require("log4js").getLogger();

const sequelize = new Sequelize('database', config.username, config.password, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'EsdeathDb.sqlite',
});

const User = require('./Esdeath.Core/Database/dbObjects/User')(sequelize, Sequelize.DataTypes);
require('./Esdeath.Core/Database/dbObjects/Server')(sequelize, Sequelize.DataTypes);
require('./Esdeath.Core/Database/dbObjects/ServerUser')(sequelize, Sequelize.DataTypes);
require('./Esdeath.Core/Database/dbObjects/Timers')(sequelize, Sequelize.DataTypes);
require('./Esdeath.Core/Database/dbObjects/Warnings')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');
