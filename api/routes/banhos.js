const routes = require('express').Router();
const banhosController = require('../controllers/banhos');
const verificarToken = require('../middlewares/verificarToken');
const verificarBanho = require('../middlewares/verificarEstadoDoBanho');
const validarDados = require('../helpers/verificarDadosBanho');

const pathname = '/banhos';

routes.get(`${pathname}/listar`, banhosController.listar);
routes.get(`${pathname}/historico/perfil`, verificarToken, banhosController.listarHistoricoPorPerfil);
routes.get(`${pathname}/historico/banho`, verificarToken, banhosController.detalharBanho);

routes.post(`${pathname}/finalizar`, verificarToken, verificarBanho, banhosController.finalizar);
routes.post(`${pathname}/registrar`, verificarToken, verificarBanho, validarDados, banhosController.registrar);


module.exports = routes;