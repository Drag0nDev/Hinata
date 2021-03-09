module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Autofeed', {
            serverId: DataTypes.STRING,
            webhookId: DataTypes.STRING,
            subreddit: DataTypes.STRING,
            showNSFW: DataTypes.STRING,
            channel: DataTypes.STRING
        },
        {
            timestamps: false,
        }
    );
}