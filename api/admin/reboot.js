const readlineSync = require("readline-sync");
const bcrypt = require('bcrypt-nodejs');
const Perfil = require('../models/Perfil');
const BanhoHist = require('../collections/banho');
require('dotenv/config');
require('../../database/sequelize');
require('../../database/mongoose');

function compararHash(senha, senhaV) {
    return bcrypt.compareSync(senha, senhaV);
}

async function excluirHistoricos() {
    console.log('\x1b[33m%s\x1b[0m', "Excluindo históricos...");
    try {
        await BanhoHist.deleteMany()
            .then(res => console.log(res.deletedCount + " registro(s) de histórico apagados. "));
        console.log('\x1b[36m%s\x1b[0m', "Exclusão de históricos concluída. ");
    } catch (err) {
        console.log("Erro ao excluir histórico. ");
        throw new Error("Detalhes do erro: " + err);
    }
}

async function excluirPerfis() {
    console.log('\x1b[33m%s\x1b[0m', "Excluindo perfis...");
    try {
        await Perfil.destroy({ where: {} })
            .then(res => console.log(res + " perfil(is) apagado(s). "));
        console.log('\x1b[36m%s\x1b[0m', "Exclusão de perfis concluída. ");
    } catch (err) {
        console.log("Erro ao excluir perfis. ");
        throw new Error("Detalhes do erro: " + err);
    }
}

async function reset() {
    try {
        await excluirPerfis();
        await excluirHistoricos();
    } catch (error) {
        console.log(error);
    }
}

module.exports = () => {
    try {
        console.clear();
        console.log("CENTRALTEMP REBOOT");
        console.log('\x1b[33m%s\x1b[0m', "ATENÇÃO: é altamente recomendável que o servidor não esteja ligado e não haja ninguém utilizando o sistema. ");

        let confirmacao = readlineSync.keyInYNStrict("Deseja mesmo redefinir todo o sistema? Esta acao nao podera ser desfeita! ", { guide: true });

        if (confirmacao) {
            let senha = readlineSync.question("Digite a senha de admin: ", {
                hideEchoBack: true,
                encoding: 'utf8'
            });

            if (!compararHash(senha, process.env.ADMIN_PASS)) {
                console.log('\x1b[31m%s\x1b[0m', "Senha incorreta. ");
                process.exit(0);
            }

            console.log('\x1b[33m%s\x1b[0m', "Iniciando reboot...");
            reset()
                .then(() => process.exit(0))
        } else {
            process.exit(0);
        }
    } catch (err) {
        console.log('\x1b[31m%s\x1b[0m', "Ocorreu um erro. " + err);
        process.exit(1);
    }
}