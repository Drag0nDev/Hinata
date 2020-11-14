const config = require('../../../config.json');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('server', {
            serverName: DataTypes.STRING,
            serverId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            prefix: DataTypes.STRING,
            muteRoleId: DataTypes.STRING,
            modlogChannel: DataTypes.STRING,
            joinLeaveLogChannel: DataTypes.STRING,
            logChannel: DataTypes.STRING,
            levelUpMessage: DataTypes.STRING,
            levelUpRoleMessage: DataTypes.STRING
        },
        {
            timestamps: false,
        }
    );
};