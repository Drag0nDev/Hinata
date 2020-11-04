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
const Server = require('./Esdeath.Core/Database/dbObjects/Server')(sequelize, Sequelize.DataTypes);
const ServerUser = require('./Esdeath.Core/Database/dbObjects/ServerUser')(sequelize, Sequelize.DataTypes);
const Timers = require('./Esdeath.Core/Database/dbObjects/Timers')(sequelize, Sequelize.DataTypes);
const Warnings = require('./Esdeath.Core/Database/dbObjects/Warnings')(sequelize, Sequelize.DataTypes);

ServerUser.belongsTo(Server, { foreignKey: 'severId', as: 'server' });
ServerUser.belongsTo(User, { foreignKey: 'UserId', as: 'user' });

module.exports = { User, Server, ServerUser, Timers, Warnings };