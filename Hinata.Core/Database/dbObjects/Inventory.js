module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Inventory', {
            userId: DataTypes.STRING,
            shopId: DataTypes.INTEGER,
            categoryId: DataTypes.INTEGER,
        },
        {
            timestamps: false,
        }
    );
}