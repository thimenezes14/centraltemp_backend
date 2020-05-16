const {Model, DataTypes} = require('sequelize');

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
            temp_escolhida: DataTypes.INTEGER
        }, {
            sequelize,
            tableName: 'banho_ativo',
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
