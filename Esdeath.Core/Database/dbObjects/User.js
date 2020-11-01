module.exports = (sequelize, DataTypes) => {
    return sequelize.define('users', {
            user_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            balance: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            xp: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            lastMessageDate: DataTypes.STRING,
            isBanned: DataTypes.INTEGER,
            dailyTaken: DataTypes.STRING,
        },
        {
            timestamps: false,
        }
    );
};