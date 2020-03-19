const routes = require('express').Router();
const banhosController = require('../controllers/banhos');
const verificarToken = require('../middlewares/verificarToken');
const validarDados = require('../helpers/verificarDadosBanho');

const pathname = '/banhos';

routes.get(`${pathname}/listar`, banhosController.listar);
routes.get(`${pathname}/finalizar/:id_banho`, banhosController.finalizar);

routes.post(`${pathname}/registrar`, verificarToken, validarDados, banhosController.registrar);

routes.delete(`${pathname}/excluir/:id_banho`, verificarToken, banhosController.excluir);

module.exports = routes;