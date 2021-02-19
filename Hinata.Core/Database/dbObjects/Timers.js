module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Timers', {
            guildId: DataTypes.STRING,
            userId: DataTypes.STRING,
            moderatorId: DataTypes.STRING,
            type: DataTypes.STRING,
            expiration: DataTypes.STRING,
            reason: DataTypes.STRING,
        },
        {
            timestamps: false,
        }
    );
}

