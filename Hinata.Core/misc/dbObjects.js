const {Sequelize} = require('sequelize');
const config = require('../../config.json');
const logger = require("log4js").getLogger();

const sequelize = new Sequelize('database', config.username, config.password, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'HinataDb.sqlite',
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
const Autofeeds = require('../Database/dbObjects/autofeed')(sequelize, Sequelize.DataTypes);
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
    foreignKey: 'categoryId'
});
User.belongsTo(Inventory, {
    foreignKey: 'badge1'
});
User.belongsTo(Inventory, {
    foreignKey: 'badge2'
});
User.belongsTo(Inventory, {
    foreignKey: 'badge3'
});
User.belongsTo(Inventory, {
    foreignKey: 'badge4'
});
User.belongsTo(Inventory, {
    foreignKey: 'badge5'
});
User.belongsTo(Inventory, {
    foreignKey: 'badge6'
});
Autofeeds.belongsTo(Servers, {
    foreignKey: 'serverId'
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
Reflect.defineProperty(User, 'addxp', {
    value: async function addxp(user, amount) {
        user.xp += amount;
        user.save();
    }
});
Reflect.defineProperty(User, 'setBg', {
    value: async function setBg(user, background) {
        user.background = background;
        user.save();
    }
});
Reflect.defineProperty(User, 'setBadge1', {
    value: async function setBg(user, badge) {
        user.badge1 = badge;
        user.save();
    }
});
Reflect.defineProperty(User, 'setBadge2', {
    value: async function setBg(user, badge) {
        user.badge2 = badge;
        user.save();
    }
});
Reflect.defineProperty(User, 'setBadge3', {
    value: async function setBg(user, badge) {
        user.badge3 = badge;
        user.save();
    }
});
Reflect.defineProperty(User, 'setBadge4', {
    value: async function setBg(user, badge) {
        user.badge4 = badge;
        user.save();
    }
});
Reflect.defineProperty(User, 'setBadge5', {
    value: async function setBg(user, badge) {
        user.badge5 = badge;
        user.save();
    }
});
Reflect.defineProperty(User, 'setBadge6', {
    value: async function setBg(user, badge) {
        user.badge6 = badge;
        user.save();
    }
});
Reflect.defineProperty(Shop, 'changeImg', {
    value: async function changeImg(shop, image) {
        shop.image = image;
        shop.save();
    }
});

module.exports = { User, Servers, ServerSettings, ServerUser, Timers, Warnings, Rewards, Shop, Category, Inventory, Autofeeds };