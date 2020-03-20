const chuveiroAPI = require('../config/requestChuveiroESP');
const Banho = require('../models/Banho');
const BanhoHist = require('../collections/banho');

module.exports = async (req, res, next) => {
    try {
        await chuveiroAPI.get('/chuveiro')
            .then(async chuveiro => {
                let { ligado } = chuveiro.data;

                if (ligado)
                    return res.status(403).send("Chuveiro já ligado. Aguarde o desligamento para solicitar outro banho. ");

                await Banho.count()
                    .then(async count => {
                        if (count > 0) {
                            const histData = { ...chuveiro.data }
                            console.log(histData);

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
                                            .catch(err => { return res.status(500).send(`Erro: ${err}`) })
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