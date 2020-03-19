'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('perfis', { 
        id_perfil: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
        },
        senha: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        nome: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        sexo: {
          type: Sequelize.CHAR(1),
          allowNull: false,
        },
        data_nasc: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        avatar: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        }
      }).then(() => queryInterface.addConstraint('perfis', ['sexo'], {
        type: 'check',
        where: {
           sexo: ['M', 'F']
        }
      }));
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('perfis');
  }
};