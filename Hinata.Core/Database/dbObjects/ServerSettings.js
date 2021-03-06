module.exports = (sequelize, DataTypes) => {
    return sequelize.define('serverSettings', {
            serverId: DataTypes.STRING,
            prefix: DataTypes.STRING,
            muteRoleId: DataTypes.STRING,
            modlogChannel: DataTypes.STRING,
            joinLeaveLogChannel: DataTypes.STRING,
            memberLogChannel: DataTypes.STRING,
            serverLogChannel: DataTypes.STRING,
            messageLogChannel: DataTypes.STRING,
            voiceLogChannel: DataTypes.STRING,
            levelUpMessage: DataTypes.STRING,
            levelUpRoleMessage: DataTypes.STRING,
            joinMessage: DataTypes.STRING,
            joinMessageChannel: DataTypes.STRING,
            leaveMessage: DataTypes.STRING,
            leaveMessageChannel: DataTypes.STRING,
            noXpRole: DataTypes.STRING,
        },
        {
            timestamps: false,
        }
    );
}