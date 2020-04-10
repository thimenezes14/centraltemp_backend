const { validationResult } = require('express-validator');
const Banho = require('../models/Banho');
const BanhoHist = require('../collections/banho');
const chuveiroAPI = require('../config/requestChuveiroESP');
const moment = require('moment');

const recomendar = require('../helpers/calcularTemperaturaRecomendada').recomendar;
const classificar = require('../helpers/calcularTemperaturaRecomendada').classificar;

module.exports = {

    async verificarChuveiro(req, res) {
        try {
            const {ligado, temp_final} = (await chuveiroAPI.get('/chuveiro')).data;
            const dados = {ligado, temperatura: temp_final};
            return res.status(200).send(dados);
        } catch (err) {
            return res.status(500).send(`Erro: ${err}`);
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

            await BanhoHist.find({id_perfil}, null, {sort: {data_hora_insercao: -1}})
                .then(async docs => {
                    const dados_cl = await classificar(docs);
                    const historico = docs.map((d, index) => {
                        return {
                            temp_ambiente: d.temp_ambiente,
                            temp_utilizada: d.temp_final,
                            duracao_seg: d.duracao_seg,
                            classificacao: dados_cl[index].classificacao,
                            dia: moment(d.data_hora_insercao).format('DD/MM/YYYY'),
                            hora: moment(d.data_hora_insercao).format('HH:mm:ss'),
                        }
                    });
                    res.status(200).json(historico);
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
                const sensor = (await chuveiroAPI.get('/sensor')).data;

                //Adicionar tempo de duração, temperatura ambiente e temperatura final apenas como exemplo. Remover campos quando ESP for integrada.
                await chuveiroAPI.post('/chuveiro', { id_banho: banho.id_banho, id_perfil, temp_escolhida, temp_ambiente: sensor.temperatura, temp_final: temp_escolhida, duracao_seg: 300, ligado: true })
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
                return res.status(500).send(`Erro: ${err}`);
            }
        } catch (err) {
            res.status(500).send(`Erro: ${err}`);
        }
    },
    async recomendar(req, res) {
        const { token } = res.locals;
        try {
            const sensor = (await chuveiroAPI.get('/sensor')).data;
            const banhos = Array(await BanhoHist.find({id_perfil: token.id}))[0];
            
            const dadosBanho = banhos.map(banho => {return {temp_ambiente: banho.temp_ambiente, temp_final: banho.temp_final}})
            const recomendacoes = await recomendar(dadosBanho, sensor.temperatura);
            return res.status(200).json(recomendacoes);
        } catch (err) {
            return res.status(500).send(`Não foi possível recomendar temperatura para banho. Erro: ${err}`);
        }
    },
    async finalizar(req, res) {
        return res.status(200).send("Banho finalizado! ");
    },                      
    async ligarChuveiroManual(req, res) {
        const {temperatura} = req.body;
        try {
            await chuveiroAPI.post('/chuveiro', { temp_escolhida: temperatura, temp_final: temperatura, ligado: true })
            res.status(201).json({temperatura, ligado: true});
        } catch (err) {
            return res.status(500).send(`Erro: ${err}`)
        }
    }
}