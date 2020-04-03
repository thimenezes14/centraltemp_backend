'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('imagens', { 
        id_preferencia: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
        },
        nome: {
          type: Sequelize.STRING,
          allowNull: false,
          match: /([a-zA-Z0-9\s_\\.\-\(\):])+(.png|.jpg|.jpeg)$/
        },
        caminho: {
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
      })
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('imagens');
  }
};