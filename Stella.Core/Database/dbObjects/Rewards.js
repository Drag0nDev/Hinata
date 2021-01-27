module.exports = (sequelize, DataTypes) => {
    return sequelize.define('rewards', {
            serverId: DataTypes.STRING,
            xp: DataTypes.STRING,
            roleId: DataTypes.STRING,
        },
        {
            timestamps: false,
        }
    );
}