module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Warnings', {
            casenr: DataTypes.INTEGER,
            guildId: DataTypes.STRING,
            userId: DataTypes.STRING,
            moderatorId: DataTypes.STRING,
            reason: DataTypes.STRING,
        },
        {
            timestamps: false,
        }
    );
}