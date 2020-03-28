const sequelize = require('sequelize');
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');

const Perfil = require('../models/Perfil');
const Preferencia = require('../models/Preferencia');
const Banho = require('../models/Banho');

const gerarHash = require('../helpers/hashing').hash;
const verificarHash = require('../helpers/hashing').compare;

module.exports = {
    async listar(req, res) {
        await Perfil.findAll({
            attributes: ['id_perfil', 'nome', 'sexo', [sequelize.fn('to_char', sequelize.col('data_nasc'), 'dd/mm/YYYY'), 'data_nasc'], 'avatar'],
            order: [
                ['nome', 'ASC']
            ]
        })
            .then(perfis => {return res.status(200).json(perfis)})
            .catch(err => {return res.status(500).send(`Erro: ${err}`)})
    },
    async cadastrar(req, res) {
        const { nome, sexo, data_nasc, senha, avatar } = req.body;
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(422).json({ err: errors.array().map(item => { return item.msg }) });
        }

       const t = await Perfil.sequelize.transaction({autocommit: false});

       try {
           let hash = await gerarHash(senha);
           const perfil = await Perfil.create({nome, senha: hash, sexo, data_nasc, avatar}, {transaction: t});
           await Preferencia.create({id_perfil: perfil.id_perfil}, {transaction: t})

           await t.commit();
           return res.status(201).send();
       } catch (err) {
           await t.rollback();
           return res.status(500).send(`Erro: ${err}`);
       }

    },
    async detalhar(req, res) {
        const { id } = req.params;
        const { token } = res.locals;

        if (!id)
            return res.status(400).send("ID para detalhamento não fornecido. ");

        if(id !== token.id)
            return res.status(401).send("O ID informado difere do informado no token. ");

        try {
            const perfil = await Perfil.findOne({
                attributes: ['id_perfil', 'nome', 'sexo', [sequelize.fn('to_char', sequelize.col('data_nasc'), 'dd/mm/YYYY'), 'data_nasc'], 'avatar'],
                include: [
                            {model: Preferencia, as: 'preferencia', attributes: ['temp_frio', 'temp_morno', 'temp_quente']},
                            {model: Banho, as: 'banho_ativo', attributes: ['id_banho', 'temp_escolhida']}
                         ],
                where: { id_perfil: id }
            });

            return res.status(200).json(perfil);
        } catch (err) {
            return res.status(500).send(`Erro: ${err}`);
        }

    },
    async autenticar(req, res) {
        const {id, senha} = req.body;

        if(!id || !senha)
            return res.status(400).send("ID e/ou Senha não fornecidos. ");

            await Perfil.findOne({
                attributes: ['id_perfil', 'senha'],
                where: { id_perfil: id }
            })
                .then(async perfil => {

                    await verificarHash(senha, perfil.senha, async (err, isMatch) => {
                        if (err || !isMatch)
                            return res.status(401).send("ID e/ou Senha inválidos. ");
    
                        const token = await jwt.sign({
                            id: perfil.id_perfil
                        },
                            process.env.JWT_SECRET,
                            {
                                expiresIn: "1h"
                            }
                        );
    
                        return res.status(200).json({token});
                    })
                })
                .catch(err => { return res.status(500).send(`Erro: ${err}`) })
    },
    async atualizar(req, res) {
        const { nome, senha, avatar } = req.body;
        const { id } = req.params;
        const { token } = res.locals;

        if (!id)
            return res.status(400).send("ID não fornecido. ");

        if (id !== token.id)
            return res.status(401).send("O ID informado difere do informado no token. ");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ err: errors.array().map(item => { return item.msg }) });
        }

        let campos = {nome};

        if(senha) {
            campos.senha = await gerarHash(senha);
        }

        if(avatar) {
            campos.avatar = avatar;
        }

        await Perfil.update(campos, { where: { id_perfil: id } })
                .then(() => { return res.status(200).send() })
                .catch(err => { return res.status(500).send(`Erro: ${err}`) })

    },
    excluir(req, res) {
        const { id } = req.params;
        const { token } = res.locals;

        if (!id)
            return res.status(400).send("ID não informado para exclusão. ");

        if (id !== token.id)
            return res.status(403).send("O ID informado difere do informado no token. ");

        Perfil.destroy({ where: { id_perfil: id } })
            .then(() => { return res.status(202).send() })
            .catch(err => { return res.status(500).send(`Erro: ${err}`) })
    }
}