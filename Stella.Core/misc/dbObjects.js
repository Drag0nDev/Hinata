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
const Server = require('../Database/dbObjects/Server')(sequelize, Sequelize.DataTypes);
const ServerUser = require('../Database/dbObjects/ServerUser')(sequelize, Sequelize.DataTypes);
const Timers = require('../Database/dbObjects/Timers')(sequelize, Sequelize.DataTypes);
const Warnings = require('../Database/dbObjects/Warnings')(sequelize, Sequelize.DataTypes);

ServerUser.belongsTo(Server, { foreignKey: 'guildId', as: 'server' });
ServerUser.belongsTo(User, { foreignKey: 'UserId', as: 'user' });


module.exports = { User, Server, ServerUser, Timers, Warnings };