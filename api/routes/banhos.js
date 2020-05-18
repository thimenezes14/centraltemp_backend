const routes = require('express').Router();
const banhosController = require('../controllers/banhos');
const verificarToken = require('../middlewares/verificarToken');
const verificarBanho = require('../middlewares/verificarEstadoDoBanho');
const validarDados = require('../helpers/verificarDadosBanho');

const pathname = '/banhos';

routes.get(`${pathname}/verificarchuveiro`, banhosController.verificarChuveiro);
routes.get(`${pathname}/historico`, verificarToken, banhosController.listarHistoricoPorPerfil);
routes.get(`${pathname}/recomendartemperatura`, verificarToken, banhosController.recomendar);

routes.post(`${pathname}/finalizar`, verificarBanho, banhosController.finalizar);
routes.post(`${pathname}/registrar`, verificarToken, verificarBanho, validarDados, banhosController.registrar);
routes.post(`${pathname}/ligarchuveiromanual`, verificarBanho, banhosController.ligarChuveiroManual);

module.exports = routes;