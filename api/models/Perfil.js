const {Model, DataTypes} = require('sequelize');

class Perfil extends Model {
    static init(sequelize) {
        super.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            senha: DataTypes.STRING,
            nome: DataTypes.STRING,
            sexo: DataTypes.CHAR,
            data_nasc: DataTypes.DATEONLY,
            avatar: DataTypes.STRING
        }, {
            sequelize,
            tableName: 'perfis',
        })
    }

    static associate(models) {

    }
}

module.exports = Perfil;

//No método "define", inserir nome da model.
//Na propriedade "tableName", inserir nome da tabela.