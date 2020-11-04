module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user', {
            userId: {
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
            level: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            lastMessageDate: {
                type: DataTypes.STRING,
                defaultValue: '0',
            },
            isBanned: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            dailyTaken: DataTypes.STRING,
            dailyStreak: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
        },
        {
            timestamps: false,
        }
    );
};