module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Autofeed', {
            serverId: DataTypes.STRING,
            webhookId: DataTypes.STRING,
            subreddit: DataTypes.STRING,
            showNSFW: DataTypes.STRING,
            channel: DataTypes.STRING,
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            }
        },
        {
            timestamps: false,
        }
    );
}