const {Sequelize} = require('sequelize');
const config = require('../../config.json');
const logger = require("log4js").getLogger();

const sequelize = new Sequelize('database', config.username, config.password, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'StellaDb.sqlite',
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
Shop.belongsTo(Category, {
    foreignKey: 'category',
    as: 'categoryId'
});
Inventory.belongsTo(User, {
    foreignKey: 'userId',
    as: 'UserId'
});
Inventory.belongsTo(Shop, {
    foreignKey: 'shopId',
    as: 'ShopId'
});
Inventory.belongsTo(Category, {
    foreignKey: 'cateogryId',
    as: 'CategoryId'
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