module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Inventory', {
            userId: DataTypes.STRING,
            shopId: DataTypes.STRING,
            categoryId: DataTypes.INTEGER,
        },
        {
            timestamps: false,
        }
    );
}