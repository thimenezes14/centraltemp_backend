const Sequelize = require('sequelize');
const db = require('./config/database');
const conn = new Sequelize(db);

const Perfil = require('../../api/models/Perfil');
const Banho = require('../../api/models/Banho');
const Preferencia = require('../../api/models/Preferencia');

Perfil.init(conn);
Banho.init(conn);
Preferencia.init(conn);


Perfil.associate(conn.models);
Banho.associate(conn.models);
Preferencia.associate(conn.models);
console.log("Sequelize Conectado. ");

module.exports = conn;