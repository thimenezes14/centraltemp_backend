const chuveiroAPI = require('../config/requestChuveiroESP');
const Banho = require('../models/Banho');
const BanhoHist = require('../collections/banho');

module.exports = async (req, res, next) => {
    try {
        await chuveiroAPI.get('/chuveiro')
            .then(async chuveiro => {
                let { id_banho, id_perfil, temp_ambiente, temp_escolhida, temp_final, duracao_seg, ligado } = chuveiro.data;

                if (ligado)
                    return res.status(403).send("Chuveiro ligado. Aguarde o seu desligamento para finalizar ou solicitar um banho. ");

                if (id_banho) {
                    await Banho.findAndCountAll()
                        .then(async resultado => {
                            if (resultado.count > 0) {

                                const histData = {
                                    id_perfil,
                                    temp_ambiente,
                                    temp_escolhida,
                                    temp_final,
                                    duracao_seg
                                };

                                const t = await Banho.sequelize.transaction({ autocommit: false });

                                try {
                                    await Banho.destroy({ where: {} }, { transaction: t })
                                        .then(async () => {
                                            await new BanhoHist(histData).save()
                                                .then(() => {
                                                    console.log("Histórico criado. ");
                                                    t.commit();
                                                    next();
                                                })
                                                .catch(err => {
                                                    t.rollback();
                                                    return res.status(500).send(`Erro: ${err}`)
                                                })
                                        })
                                        .catch(err => { return res.status(500).send(`Erro: ${err}`) })
                                } catch (err) {
                                    t.rollback();
                                    return res.status(500).send(`Erro: ${err}`);
                                }
                            } else {
                                next();
                            }

                        })
                        .catch(err => { res.status(500).send(`Erro: ${err}`) })
                } else {
                    next();
                }
            })
            .catch(err => { return res.status(500).send(`Erro: ${err}`) });
    } catch (err) {
        return res.status(500).send(`Erro: ${err}`);
    }
}