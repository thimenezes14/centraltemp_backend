const Sequelize = require('sequelize');
const db = require('./config/database');

const Perfil = require('../../api/models/Perfil');
const conn = new Sequelize(db);

Perfil.init(conn);
console.log("Sequelize Conectado. ");

module.exports = conn;