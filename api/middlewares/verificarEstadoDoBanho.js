const moment = require('moment');
const chuveiroAPI = require('../config/requestChuveiroESP');
const Banho = require('../models/Banho');
const BanhoHist = require('../collections/banho');

function pad(num) {
    return ("0"+ num ).slice(-2);
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
                let { id_banho, id_perfil, temp_escolhida, temp_final, duracao, ligado } = chuveiro.data;

                if (ligado)
                    return res.status(403).send("Chuveiro já ligado. Aguarde o desligamento para solicitar outro banho. ");

                await Banho.findAndCountAll()
                    .then(async resultado => {
                        if (resultado.count > 0) {
                        
                            const histData = { 
                                id_banho,
                                id_perfil,
                                temp_escolhida,
                                temp_final,
                                duracao_hhmmss: converteParaHoraMinutoSegundo(duracao)
                            };

                            const t = await Banho.sequelize.transaction({ autocommit: false });

                            try {
                                await Banho.destroy({ where: { id_banho: histData.id_banho } }, { transaction: t })
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

            })
            .catch(err => { return res.status(500).send(`Erro: ${err}`) });
    } catch (err) {
        return res.status(500).send(`Erro: ${err}`);
    }
}