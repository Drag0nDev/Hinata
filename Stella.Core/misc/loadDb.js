const Sequelize = require('sequelize');
const config = require('../../config.json');
const logger = require("log4js").getLogger();

const sequelize = new Sequelize('database', config.username, config.password, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'StellaDb.sqlite',
});

require('../Database/dbObjects/User')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/Server')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/ServerUser')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/ServerSettings')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/Timers')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/Warnings')(sequelize, Sequelize.DataTypes);
require('../Database/dbObjects/Rewards')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');
sequelize.sync({ force }).then(async () => {
    console.log('Database synced');
    await sequelize.close();
}).catch(console.error);