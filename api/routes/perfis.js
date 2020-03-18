const routes = require('express').Router();
const perfisController = require('../controllers/perfis');
const verificarDados = require('../helpers/verificarDadosPerfil');
const verificarToken = require('../middlewares/verificarToken');

const pathname = '/perfis';

routes.get(`${pathname}/listar`, perfisController.listar);
routes.get(`${pathname}/:id`, verificarToken, perfisController.detalhar);

routes.post(`${pathname}/cadastrar`, verificarDados.cadastro, perfisController.cadastrar);
routes.post(`${pathname}/autenticar`, perfisController.autenticar);

routes.put(`${pathname}/atualizar/:id`, verificarToken, verificarDados.atualizacao, perfisController.atualizar);

routes.delete(`${pathname}/excluir/:id`, verificarToken, perfisController.excluir);

module.exports = routes;

