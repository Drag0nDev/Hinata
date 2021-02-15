const {Sequelize} = require('sequelize');
const config = require('../../config.json');
const logger = require("log4js").getLogger();

const sequelize = new Sequelize('database', config.username, config.password, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'StellaDb.sqlite',
    retry: {
        match: [
            /SQLITE_BUSY/,
        ],
        name: 'query',
        max: 100
    },
    pool: {
        idle: 60000,
        max: 100,
        acquire: 120000,
    },
});

const User = require('../Database/dbObjects/User')(sequelize, Sequelize.DataTypes);
const Servers = require('../Database/dbObjects/Server')(sequelize, Sequelize.DataTypes);
const ServerSettings = require('../Database/dbObjects/ServerSettings')(sequelize, Sequelize.DataTypes);
const ServerUser = require('../Database/dbObjects/ServerUser')(sequelize, Sequelize.DataTypes);
const Timers = require('../Database/dbObjects/Timers')(sequelize, Sequelize.DataTypes);
const Warnings = require('../Database/dbObjects/Warnings')(sequelize, Sequelize.DataTypes);
const Rewards = require('../Database/dbObjects/Rewards')(sequelize, Sequelize.DataTypes);
const Shop = require('../Database/dbObjects/Shop')(sequelize, Sequelize.DataTypes);
const Category = require('../Database/dbObjects/Category')(sequelize, Sequelize.DataTypes);
const Inventory = require('../Database/dbObjects/Inventory')(sequelize, Sequelize.DataTypes);

//assign foreign keys
ServerUser.belongsTo(Servers, {
    foreignKey: 'guildId'
});
ServerUser.belongsTo(User, {
    foreignKey: 'UserId'
});
ServerSettings.belongsTo(Servers, {
    foreignKey: 'serverId',
    as: 'server'
});
Shop.belongsTo(Category, {
    foreignKey: 'category'
});
Inventory.belongsTo(User, {
    foreignKey: 'userId'
});
Inventory.belongsTo(Shop, {
    foreignKey: 'shopId'
});
Inventory.belongsTo(Category, {
    foreignKey: 'cateogryId'
});


//database functions
Reflect.defineProperty(User, 'remove', {
    value: async function add(user, amount) {
        user.balance -= amount;
        user.save();
    }
});
Reflect.defineProperty(User, 'add', {
    value: async function add(user, amount) {
        user.balance += amount;
        user.save();
    }
});
Reflect.defineProperty(User, 'addDaily', {
    value: async function add(user, amount) {
        user.balance += amount;
        user.dailyStreak++;
        user.save();
    }
});
Reflect.defineProperty(User, 'changeColor', {
    value: async function changeColor(user, colorCode) {
        user.color = colorCode;
        user.save();
    }
});

module.exports = { User, Server: Servers, ServerSettings, ServerUser, Timers, Warnings, Rewards, Shop, Category, Inventory };