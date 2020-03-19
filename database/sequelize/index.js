const Sequelize = require('sequelize');
const db = require('./config/database');

const Perfil = require('../../api/models/Perfil');
const Banho = require('../../api/models/Banho');
const conn = new Sequelize(db);

Perfil.init(conn);
Banho.init(conn);

Perfil.associate(conn.models);
Banho.associate(conn.models);
console.log("Sequelize Conectado. ");

module.exports = conn;