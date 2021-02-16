module.exports = (sequelize, DataTypes) => {
    return sequelize.define('rewards', {
            serverId: DataTypes.STRING,
            xp: DataTypes.INTEGER,
            roleId: DataTypes.STRING,
        },
        {
            timestamps: false,
        }
    );
}