'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('banhos', { 
        id_banho: {
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
        temp_escolhida: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        temp_final: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        ativo: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
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
      return queryInterface.dropTable('banhos');
  }
};