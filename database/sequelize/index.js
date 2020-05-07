const Sequelize = require('sequelize');
const db = require('./config/database');
const conn = new Sequelize(db);

const Perfil = require('../../api/models/Perfil');
const Banho = require('../../api/models/Banho');

Perfil.init(conn);
Banho.init(conn);

Perfil.associate(conn.models);
Banho.associate(conn.models);

module.exports = conn;