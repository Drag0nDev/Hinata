const {Sequelize} = require('sequelize');
const config = require('../../config.json');
const logger = require("log4js").getLogger();

const sequelize = new Sequelize('database', config.username, config.password, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'HinataDb.sqlite',
    pool: {
        idle: 60000,
        max: 100,
        acquire: 120000,
    },
});

require('../Database/dbObjects/User')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/Server')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/ServerUser')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/ServerSettings')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/Timers')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/Warnings')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/Rewards')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/Shop')(sequelize, Sequelize.DataTypes);
const Category = require('../Database/dbObjects/Category')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/Inventory')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
    const category =  [
        await Category.upsert({name: 'background'}),
        await Category.upsert({name: 'badge'}),
        await Category.upsert({name: 'hidden'})
    ];

    await Promise.all(category);

    logger.info('Database synced');
    await sequelize.close();
}).catch(console.error);