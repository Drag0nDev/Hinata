module.exports = (sequelize, DataTypes) => {
    return sequelize.define('ServerUser', {
            guildId: DataTypes.STRING,
            userId: DataTypes.STRING,
            xp: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            lastMessageDate: DataTypes.STRING,
            isMuted: DataTypes.INTEGER,
        },
        {
            timestamps: false,
        }
    );
}