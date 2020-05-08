const {Model, DataTypes} = require('sequelize');

class Admin extends Model {
    static init(sequelize) {
        super.init({
            id_admin: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            email: DataTypes.STRING,
            senha: DataTypes.STRING, 
        }, {
            sequelize,
            tableName: 'admin',
        })
    }

    static associate(models) {
        
    }
}

module.exports = Admin;