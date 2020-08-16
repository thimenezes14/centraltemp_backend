const routes = require('express').Router();
const perfisController = require('../controllers/perfis');
const verificarDados = require('../helpers/verificarDadosPerfil');
const verificarToken = require('../middlewares/verificarToken');
const contarPerfis = require('../middlewares/contarPerfis');

const pathname = '/perfis';

routes.get(`${pathname}/listar`, perfisController.listar);
routes.get(`${pathname}/imagens`, perfisController.listarImagensParaPerfil);
routes.get(`${pathname}/:id`, verificarToken, perfisController.detalhar);

routes.post(`${pathname}/cadastrar`, verificarDados.cadastro, contarPerfis, perfisController.cadastrar);
routes.post(`${pathname}/autenticar`, perfisController.autenticar);

routes.put(`${pathname}/atualizar/:id`, verificarToken, verificarDados.atualizacao, perfisController.atualizar);

routes.delete(`${pathname}/excluir/:id`, verificarToken, perfisController.excluir);
routes.delete(`${pathname}/excluirhistorico/:id`, verificarToken, perfisController.excluirHistorico);

module.exports = routes;

