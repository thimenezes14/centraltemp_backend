const routes = require('express').Router();

const pathname = '/preferencias';
routes.get(`${pathname}/listar`, (req, res) => res.send("preferencia ok"));
//routes.post('');

module.exports = routes;