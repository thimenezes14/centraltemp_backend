const sequelize = require('sequelize');
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');

const Banho = require('../models/Banho');
const Perfil = require('../models/Perfil');

module.exports = {
    async listar(req, res) {
        await Banho.findAll({
            attributes: ['id_banho', 'id_perfil', 'temp_escolhida', 'temp_final', 'ativo']
        })
            .then(banhos => {return res.status(200).json(banhos)})
            .catch(err => {return res.status(500).send(`Erro: ${err}`)})
    },
    async registrar(req, res) {
        //Realizar requisição ao chuveiro.
        //Se requisição for bem sucedida, inserir o registro abaixo.
        
        const {id_perfil, temp_escolhida} = req.body;
        const { token } = res.locals;

        if(id_perfil !== token.id)
            return res.status(401).send("ID para registro de banho difere do ID do usuário logado. ");

        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(422).json({ err: errors.array().map(item => { return item.msg }) });
        }

        await Banho.create({id_perfil, temp_escolhida})
            .then(()=> {return res.status(201).send()})
            .catch(err => {return res.status(500).send(`Erro: ${err}`)})
    },
    async finalizar(req, res) {
        //Requisição à ESP deve ser feita.
        //Se o chuveiro estiver desligado, atualizar o registro da base de dados.
        //Os dados a serem retornados são: temperatura final e data/hora da operação.
        const { id_banho } = req.params;

        await Banho.findOne({
                attributes: ['id_banho', 'id_perfil', 'temp_escolhida', 'temp_final', 'ativo'],
                where: {id_banho}
            })
                .then(banho => {return res.status(200).json(banho)})
                .catch(err => {return res.status(500).send(`Erro: ${err}`)})

        
    },
    async excluir(req, res) {
        const { id_banho } = req.params;
        const { id_perfil } = req.query;
        const { token } = res.locals;

        if(id_perfil !== token.id)
            return res.status(401).send("ID para exclusão de banho de usuário difere do ID do usuário logado. ");

        await Banho.destroy({where: {id_banho}})
            .then(()=> {return res.status(202).send()})
            .catch(err => {return res.status(500).send(`Erro: ${err}`)})
    }
}