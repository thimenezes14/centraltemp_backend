const readline = require("readline");

const Perfil = require('../models/Perfil');
const BanhoHist = require('../collections/banho');
require('dotenv/config');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.clear();
console.log("CENTRALTEMP REBOOT");

console.log('\x1b[33m%s\x1b[0m', "ATENÇÃO: é altamente recomendável que o servidor não esteja ligado e não haja ninguém utilizando o sistema. ");

rl.question("Deseja mesmo redefinir todo o sistema? --> (S/N)\nOBS.: ESSA AÇÃO É IRREVERSÍVEL!\n", function(resposta) {
    const res = resposta.toLocaleUpperCase();
    switch(res) {
        case 'S':
            rl.question("Entre com a senha para reset:  ", function(senha) {
                if(senha !== process.env.REBOOT_PASS) {
                    console.log('\x1b[31m%s\x1b[0m', "Senha incorreta. ");
                    rl.close();
                }
                console.log('\x1b[33m%s\x1b[0m', "Iniciando reboot...");
                require('../../database/sequelize');
                require('../../database/mongoose');
                reset()
                    .then(() => process.exit(0))
                    .catch(err => {
                        console.log('\x1b[31m%s\x1b[0m', err);
                        process.exit(1);
                    })
            }); 
            break;
        case 'N':
            console.log("Saindo...");
            rl.close();
        default:
            console.log('\x1b[31m%s\x1b[0m', "Resposta inválida. Responda com 'S' ou 'N'. ");
            process.exit(0);
    }
});

rl.on("close", function() {
    console.log("\nProcesso finalizado. ");
    process.exit(0);
});

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
        await Perfil.destroy({where: {}})
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