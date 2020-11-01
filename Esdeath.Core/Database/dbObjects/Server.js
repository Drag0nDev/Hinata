const config = require('../../../config.json');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('users', {
            guildId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            prefix: DataTypes.STRING,
            muteRoleId: DataTypes.STRING,
            modlogChannel: DataTypes.STRING,
            logChannel: DataTypes.STRING,
        },
        {
            timestamps: false,
        }
    );
};