module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Warnings', {
            guildId: DataTypes.STRING,
            userId: DataTypes.STRING,
            moderatorId: DataTypes.INTEGER,
            reason: DataTypes.STRING,
        },
        {
            timestamps: false,
        }
    );
};