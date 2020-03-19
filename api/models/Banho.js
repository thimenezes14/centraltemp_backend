const {Model, DataTypes} = require('sequelize');
const sequelize = require('sequelize');

class Banho extends Model {
    static init(sequelize) {
        super.init({
            id_banho: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            id_perfil: {
                type: DataTypes.UUID,
                references: {
                    model: 'perfis',
                    key: 'id_perfil'
                },
                onDelete: 'CASCADE'
            },
            temp_escolhida: DataTypes.INTEGER,
            ativo: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
        }, {
            sequelize,
            tableName: 'banhos',
        })
    }

    static associate(models) {
        this.belongsTo(models.Perfil, {
            as: 'banhos',
            foreignKey: 'id_perfil',
            onDelete: 'CASCADE'
        })
    }
}

module.exports = Banho;
