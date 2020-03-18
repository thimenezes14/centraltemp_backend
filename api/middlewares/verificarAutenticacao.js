const Perfil = require('../models/Perfil');
const verificarHash = require('../helpers/hashing').compare;

module.exports = (req, res, next) => {
    const token = res.locals.token.id;
    const { senhaConfirmacao } = req.body;

    if (!token || !senha)
        return res.status(400).send("Não foram informados dados para verificação. ");

    Perfil.findOne({
        attributes: ['id', 'senha'],
        where: {id: token}
    })
        .then(perfil => {
            
            verificarHash(senhaConfirmacao, perfil.senha, (err, isMatch) => {
                if(err || !isMatch)
                    return res.status(401).send("ID e/ou Senha inválidos. ");

                next();
            });
        })
        .catch((err) => { return res.status(500).send(`Erro: ${err}`)});

}