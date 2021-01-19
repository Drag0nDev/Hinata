const config = require('../../../config.json');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('server', {
            serverName: DataTypes.STRING,
            serverId: {
                type: DataTypes.STRING,
                primaryKey: true,
            }
        },
        {
            timestamps: false,
        }
    );
};