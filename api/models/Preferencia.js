const {Model, DataTypes} = require('sequelize');

class Preferencia extends Model {
    static init(sequelize) {
        super.init({
            id_preferencia: {
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
            temp_frio: {
                type: DataTypes.INTEGER,
                defaultValue: 25
            },
            temp_morno:{
                type: DataTypes.INTEGER,
                defaultValue: 34
            },
            temp_quente: {
                type: DataTypes.INTEGER,
                defaultValue: 43
            }
        }, {
            sequelize,
            tableName: 'preferencias',
        })
    }

    static associate(models) {
        this.belongsTo(models.Perfil, {
            as: 'preferencias',
            foreignKey: 'id_perfil',
            onDelete: 'CASCADE'
        })
    }
}

module.exports = Preferencia;
