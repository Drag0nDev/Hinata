module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Inventory', {
            invId: {
                type: DataTypes.INTEGER,
                primaryKey: false
            },
            userId: DataTypes.STRING,
            shopId: DataTypes.INTEGER,
            categoryId: DataTypes.INTEGER,
        },
        {
            timestamps: false,
        }
    );
}