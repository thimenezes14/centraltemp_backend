const {check} = require('express-validator');

module.exports = [
    check('id_perfil')
        .matches(/^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/)
        .withMessage('ID inválida ou em formato incorreto. '),

    check('temp_escolhida')
        .isNumeric()
        .withMessage('Temperatura escolhida inválida. ')
]