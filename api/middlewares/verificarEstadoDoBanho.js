const chuveiroAPI = require('../config/requestChuveiroESP');
const Banho = require('../models/Banho');
const BanhoHist = require('../collections/banho');

function pad(num) {
    return ("0" + num).slice(-2);
}

function converteParaHoraMinutoSegundo(segundos) {
    let minutos = Math.floor(segundos / 60);
    segundos = segundos % 60;
    let horas = Math.floor(minutos / 60)
    minutos = minutos % 60;
    return `${pad(horas)}:${pad(minutos)}:${pad(segundos)}`;
}

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
                                    await Banho.destroy({ where: { id_banho } }, { transaction: t })
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