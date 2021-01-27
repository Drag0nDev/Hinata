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
const Servers = require('../Database/dbObjects/Server')(sequelize, Sequelize.DataTypes);
const ServerSettings = require('../Database/dbObjects/ServerSettings')(sequelize, Sequelize.DataTypes);
const ServerUser = require('../Database/dbObjects/ServerUser')(sequelize, Sequelize.DataTypes);
const Timers = require('../Database/dbObjects/Timers')(sequelize, Sequelize.DataTypes);
const Warnings = require('../Database/dbObjects/Warnings')(sequelize, Sequelize.DataTypes);
const Rewards = require('../Database/dbObjects/Rewards')(sequelize, Sequelize.DataTypes);

//server databases
ServerUser.belongsTo(Servers, {
    foreignKey: 'guildId',
    as: 'server'
});
ServerUser.belongsTo(User, {
    foreignKey: 'UserId',
    as: 'user'
});
ServerSettings.belongsTo(Servers, {
    foreignKey: 'serverId',
    as: 'server'
});

module.exports = { User, Server: Servers, ServerSettings, ServerUser, Timers, Warnings, Rewards };