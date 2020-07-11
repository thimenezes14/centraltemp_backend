const { validationResult } = require('express-validator');
const Banho = require('../models/Banho');
const BanhoHist = require('../collections/banho');
const chuveiroAPI = require('../config/requestChuveiroESP');
const moment = require('moment');

const recomendar = require('../helpers/calcularTemperaturaRecomendada').recomendar;
const classificar = require('../helpers/calcularTemperaturaRecomendada').classificar;
const reg = require('../../logs/log');

module.exports = {

  async verificarChuveiro(req, res) {
    try {
      const { ligado, temp_final } = (await chuveiroAPI.get('/chuveiro')).data;
      const dados = { ligado, temperatura: temp_final };
      return res.status(200).send(dados);
    } catch (err) {
      return res.status(500).send(`Erro: ${err}`);
    }
  },
  async listarHistoricoPorPerfil(req, res) {
    try {
      const { id_perfil } = req.query;
      const { token } = res.locals;

      if (!id_perfil)
        return res.status(400).send(`ID não informado. `);

      if (id_perfil !== token.id)
        return res.status(401).send(`Você não tem autorização para esta ação. `);

      await BanhoHist.find({ id_perfil }, null, { sort: { data_hora_insercao: -1 } })
        .then(async docs => {
          const dados_cl = await classificar(docs);
          const historico = docs.map((d, index) => {
            return {
              temp_ambiente: d.temp_ambiente,
              temp_utilizada: d.temp_final,
              duracao_seg: d.duracao_seg,
              classificacao_temperatura: dados_cl[index].classificacao_temperatura,
              classificacao_duracao: dados_cl[index].classificacao_duracao,
              dia: moment(d.data_hora_insercao).format('DD/MM/YYYY'),
              hora: moment(d.data_hora_insercao).format('HH:mm:ss'),
            }
          });
          res.status(200).json(historico);
        })
        .catch(err => { return res.status(500).send(`Erro: ${err}`) })
    } catch (err) {
      return res.status(500).send(`Erro: ${err}`);
    }
  },
  async ligarChuveiroManual(req, res) {
    const { temp_escolhida } = req.body;
    try {
      await chuveiroAPI.post('/chuveiro', { temp_escolhida, temp_final: temp_escolhida, ligado: true });
      await reg.registrarAcaoBanho('registrar', null);
      res.status(201).json({ temperatura: temp_escolhida, ligado: true });
    } catch (err) {
      return res.status(500).send(`Erro: ${err}`)
    }
  },
  async registrar(req, res) {
    try {
      const { id_perfil, temp_escolhida } = req.body;
      const { token } = res.locals;
      const errors = validationResult(req);

      if (id_perfil !== token.id)
        return res.status(403).send("Você não tem autorização para esta ação. ");

      if (!errors.isEmpty()) {
        return res.status(422).send(errors.array().map(item => item.msg ));
      }

      const t = await Banho.sequelize.transaction({ autocommit: false })

      try {
        const banho = await Banho.create({ id_perfil, temp_escolhida }, { transaction: t });
        const sensor = (await chuveiroAPI.get('/sensor')).data;
        const banhos = Array(await BanhoHist.find({ id_perfil: token.id }))[0];

        const chuveiroInfo = {
          id_banho: banho.id_banho,
          id_perfil,
          temp_escolhida,
          sec_mode: token.sec_mode === true ? true : false,
          limites: (await recomendar(banhos, sensor.temperatura)).limites,

          temp_ambiente: sensor.temperatura, //Exemplo. Remover na integração final
          temp_final: temp_escolhida, //Exemplo. Remover na integração final
          duracao_seg: Math.ceil(Math.random() * (900 - 300) + 300), //Exemplo. Remover na integração final
          ligado: true, //Exemplo. Remover na integração final
        }

        await chuveiroAPI.post('/chuveiro', chuveiroInfo)
          .then(async () => {
            await t.commit();
            await reg.registrarAcaoBanho('registrar', id_perfil);
            res.status(201).json({temperatura: temp_escolhida, ligado: true, id_perfil});
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
      const banhos = Array(await BanhoHist.find({ id_perfil: token.id }))[0];
      const recomendacoes = await recomendar(banhos, sensor.temperatura);
      return res.status(200).json(recomendacoes);
    } catch (err) {
      return res.status(500).send(`Não foi possível recomendar temperatura para banho. Erro: ${err}`);
    }
  },
  async finalizar(req, res) {
    return res.status(200).send("Banho finalizado! ");
  }
}
