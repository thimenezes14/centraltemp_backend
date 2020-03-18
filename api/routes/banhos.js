const routes = require('express').Router();

const pathname = '/banhos';
routes.get(`${pathname}/listar`, (req, res) => res.send("banhos ok"));
//routes.post('');

module.exports = routes;