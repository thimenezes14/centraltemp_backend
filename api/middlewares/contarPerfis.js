const Perfil = require('../models/Perfil');

module.exports = (req, res, next) => {
    Perfil.count()
        .then(numPerfis => {
            if(numPerfis >= Number(process.env.MAX_PERFIS)) {
                return res.status(403).send("Limite de perfis já foi atingido. Para esta versão inicial, o limite é de 5 perfis. ");
            } else {
                next();
            }
        })
        .catch((err) => { return res.status(500).send(`Erro: ${err}`)});
}