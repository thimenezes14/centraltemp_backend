const readlineSync = require("readline-sync");
const bcrypt = require('bcrypt-nodejs');
const sequelize = require("sequelize");
require('../../../database/sequelize');
require('../../../database/mongoose');
const Perfil = require('../../models/Perfil');
const BanhoHist = require('../../collections/banho');
require('dotenv/config');

function compararHash(senha, senhaV) {
    return bcrypt.compareSync(senha, senhaV);
}

module.exports = () => {
    console.clear();
    let senha = readlineSync.question("Digite a senha de admin: ", {
        hideEchoBack: true,
        encoding: 'utf8'
    });
    
    if (!compararHash(senha, process.env.ADMIN_PASS)) {
        console.log('\x1b[31m%s\x1b[0m', "Senha incorreta. ");
        process.exit(0);
    }
    
    let opcoes = ['LISTAR PERFIS', 'CRIAR PERFIL', 'ALTERAR PERFIL', 'EXCLUIR PERFIL'];
    let index = readlineSync.keyInSelect(opcoes, 'O que deseja fazer? ', {cancel: 'CANCELAR'});
    console.log(opcoes[index] + ' foi selecionado. Opção ' + index);

    switch((index + 1)) {
        case 1:
            console.log('\x1b[36m%s\x1b[0m', "Obtendo perfis... ");
            break;
        case 2:
            console.log('\x1b[36m%s\x1b[0m', "Abrindo modo de criação... ");
            break;
        case 3:
            console.log('\x1b[36m%s\x1b[0m', "Abrindo modo de edição... ");
            break;
        case 4:
            console.log('\x1b[36m%s\x1b[0m', "Obtendo perfis para exclusão... ");
            break;
        default:
            console.log('\x1b[31m%s\x1b[0m', "Ação cancelada. ");
    }
    
    process.exit(0);
}
