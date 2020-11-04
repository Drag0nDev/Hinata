module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Timers', {
            guildId: DataTypes.STRING,
            userId: DataTypes.STRING,
            moderatorId: DataTypes.INTEGER,
            type: DataTypes.STRING,
            expiration: DataTypes.STRING,
        },
        {
            timestamps: false,
        }
    );
};

