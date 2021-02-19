module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Shop', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            image: DataTypes.STRING,
            price: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            category: DataTypes.INTEGER,
        },
        {
            timestamps: false,
        }
    );
}