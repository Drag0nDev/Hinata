const Sequelize = require('sequelize');
const config = require('./config.json');
const logger = require("log4js").getLogger();

const sequelize = new Sequelize('database', config.username, config.password, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'StellaDb.sqlite',
});

const User = require('./Stella.Core/Database/dbObjects/User')(sequelize, Sequelize.DataTypes);
const Server = require('./Stella.Core/Database/dbObjects/Server')(sequelize, Sequelize.DataTypes);
const ServerUser = require('./Stella.Core/Database/dbObjects/ServerUser')(sequelize, Sequelize.DataTypes);
const Timers = require('./Stella.Core/Database/dbObjects/Timers')(sequelize, Sequelize.DataTypes);
const Warnings = require('./Stella.Core/Database/dbObjects/Warnings')(sequelize, Sequelize.DataTypes);

ServerUser.belongsTo(Server, { foreignKey: 'guildId', as: 'server' });
ServerUser.belongsTo(User, { foreignKey: 'UserId', as: 'user' });

module.exports = { User, Server, ServerUser, Timers, Warnings };