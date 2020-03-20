const { validationResult } = require('express-validator');
const Banho = require('../models/Banho');
const BanhoHist = require('../collections/banho');
const chuveiroAPI = require('../config/requestChuveiroESP');

module.exports = {
    async listar(req, res) {
        try {
            await Banho.findAll({
                attributes: ['id_banho', 'id_perfil', 'temp_escolhida']
            })
                .then(banhos => { return res.status(200).json(banhos) })
                .catch(err => { return res.status(500).send(`Erro: ${err}`) })
        } catch (err) {
            res.status(500).send(`Erro: ${err}`)
        }

    },
    async listarHistoricoPorPerfil(req, res) {
        try {
            const { id_perfil } = req.query;
            const { token } = res.locals;
            
            if(!id_perfil)
                return res.status(400).send(`ID não informado. `);

            if(id_perfil !== token.id)
                return res.status(401).send(`Você não tem autorização para esta ação. `);

            await BanhoHist.find({id_perfil})
                .then(docs => {
                    res.status(200).json(docs);
                })
                .catch(err => {return res.status(500).send(`Erro: ${err}`)})
        } catch (err) {
            return res.status(500).send(`Erro: ${err}`);
        }
    },
    async detalharBanho(req, res) {
        try {
            const { id_banho, id_perfil } = req.query;
            const { token } = res.locals;

            if(!id_banho)
                return res.status(400).send(`ID do banho não informado. `);

            if(!id_perfil)
                return res.status(400).send(`ID do perfil não informado. `);

            if(id_perfil !== token.id)
                return res.status(401).send(`Você não tem autorização para esta ação. `);

            await BanhoHist.find({id_banho})
                .then(docs => {
                    res.status(200).json(docs);
                })
                .catch(err => {return res.status(500).send(`Erro: ${err}`)})
        } catch (err) {
            return res.status(500).send(`Erro: ${err}`);
        }
    },
    async registrar(req, res) {
        try {
            const { id_perfil, temp_escolhida } = req.body;
            const { token } = res.locals;
            const errors = validationResult(req);

            if (id_perfil !== token.id)
                return res.status(401).send("ID para registro de banho difere do ID do usuário logado. ");

            if (!errors.isEmpty()) {
                return res.status(422).json({ err: errors.array().map(item => { return item.msg }) });
            }

            const t = await Banho.sequelize.transaction({ autocommit: false })

            try {
                const banho = await Banho.create({ id_perfil, temp_escolhida }, { transaction: t });

                //Adicionar tempo de duração e temperatura final apenas como exemplo. Remover campos quando ESP for integrada.
                await chuveiroAPI.post('/chuveiro', { id_banho: banho.id_banho, id_perfil, temp_escolhida, temp_final: temp_escolhida, duracao: 300, ligado: true })
                    .then(async () => {
                        await t.commit();
                        res.status(201).send();
                    })
                    .catch(async err => {
                        await t.rollback();
                        return res.status(500).send(`Erro: ${err}`)
                    })
            } catch (err) {
                await t.rollback();
            }
        } catch (err) {
            res.status(500).send(`Erro: ${err}`);
        }
    },
    async finalizar(req, res) {
        res.status(200).send("Banho finalizado! ");
    }
}