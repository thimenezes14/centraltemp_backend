'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('preferencias', { 
        id_preferencia: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
        },
        id_perfil: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'perfis',
            key: 'id_perfil'
          },
          onDelete: 'CASCADE'
        },
        temp_frio: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        temp_morno: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        temp_quente: {
          type: Sequelize.INTEGER,
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
      })
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('preferencias');
  }
};