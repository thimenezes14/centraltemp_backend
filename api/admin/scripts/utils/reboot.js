const readlineSync = require("readline-sync");
const bcrypt = require('bcrypt-nodejs');
const Admin = require('../../../models/Admin');
const Perfil = require('../../../models/Perfil');
const BanhoHist = require('../../../collections/banho');
const adminDAO = require('../database/adminDAO');
require('dotenv/config');
require('../../../../database/sequelize');
require('../../../../database/mongoose');

const reg = require('../../../../logs/log');

function compararHash(senha, senhaV) {
    return bcrypt.compareSync(senha, senhaV);
}

async function excluirHistoricos() {
    console.log('\x1b[33m%s\x1b[0m', "Excluindo históricos...");
    try {
        let registrosHistorico = await BanhoHist.deleteMany();
        console.log('\x1b[36m%s\x1b[0m', "Exclusão de históricos concluída. " + registrosHistorico.deletedCount +" registro(s) apagado(s). ");
    } catch (err) {
        console.log("Erro ao excluir histórico. ");
        throw new Error("Detalhes do erro: " + err);
    }
}

async function excluirPerfis() {
    console.log('\x1b[33m%s\x1b[0m', "Excluindo perfis...");
    try {
        let perfisApagados = await Perfil.destroy({ where: {} });
        console.log('\x1b[36m%s\x1b[0m', "Exclusão de perfis concluída. " + perfisApagados + " perfil(is) apagado(s). ");
    } catch (err) {
        console.log("Erro ao excluir perfis. ");
        throw new Error("Detalhes do erro: " + err);
    }
}

async function reset() {
    try {
        await excluirPerfis();
        await excluirHistoricos();
        await reg.reboot();
    } catch (error) {
        console.log(error);
    }
}

module.exports = async () => {
    try {
        console.clear();
        console.log("CENTRALTEMP REBOOT");
        console.log('\x1b[33m%s\x1b[0m', "ATENÇÃO: é altamente recomendável que o servidor não esteja ligado e não haja ninguém utilizando o sistema. ");

        let confirmacao = readlineSync.keyInYNStrict("Deseja mesmo redefinir todo o sistema? Esta acao nao podera ser desfeita! ", { guide: true });

        let hasAdmin = await adminDAO.verificarAdmin()
        
        if(!hasAdmin) {
            console.log('\x1b[33m%s\x1b[0m', "Não existem administradores para executar esta ação. ");
            return;
        }

        if (confirmacao) {
            let senha = readlineSync.question("Digite a senha de admin: ", {
                hideEchoBack: true,
                caseSensitive: true
            });

            const admin = await Admin.findAll();
            if (!compararHash(senha, admin[0].senha)) {
                console.log('\x1b[31m%s\x1b[0m', "Senha incorreta. ");
                process.exit(0);
            }

            console.log('\x1b[33m%s\x1b[0m', "Iniciando reboot...");
            await reset();
            console.log('\x1b[36m%s\x1b[0m', "Reboot finalizado. ");
        } else {
            console.log('\x1b[33m%s\x1b[0m', "Operação cancelada. ");
        }
    } catch (err) {
        console.log('\x1b[31m%s\x1b[0m', "Ocorreu um erro. " + err);
        process.exit(1);
    }
}