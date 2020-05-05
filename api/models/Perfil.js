const {Model, DataTypes} = require('sequelize');

class Perfil extends Model {
    static init(sequelize) {
        super.init({
            id_perfil: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            senha: DataTypes.STRING,
            nome: DataTypes.STRING,
            sexo: DataTypes.CHAR,
            data_nasc: DataTypes.DATEONLY,
            sec_mode: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            avatar: DataTypes.STRING
        }, {
            sequelize,
            tableName: 'perfis',
        })
    }

    static associate(models) {
        this.hasOne(models.Banho, {
            as: 'banho_ativo',
            foreignKey: 'id_perfil'
        });
    }
}

module.exports = Perfil;