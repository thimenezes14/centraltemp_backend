const readlineSync = require("readline-sync");
const bcrypt = require('bcrypt-nodejs');
const Admin = require('../../models/Admin');
const enviarEmailcomNovaSenha = require('./sendEmail');
const gerarSenhaAleatoria = require('./generateRandomPassword');
require('dotenv/config');

function gerarHash(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt, null);
}

function compararHash(senha, senhaV) {
    return bcrypt.compareSync(senha, senhaV);
}

async function enviarSenhaPorEmail() {
    try {
        const admin = await Admin.findAll();
        let novaSenha = await gerarSenhaAleatoria(5);
        await enviarEmailcomNovaSenha(novaSenha, admin[0].email, 'password');
        let senhaHash = await gerarHash(novaSenha);
        await Admin.update({senha: senhaHash}, { where: {id_admin: admin[0].id_admin} });
    } catch (err) {
        console.log('\x1b[31m%s\x1b[0m', "Ocorreu um erro durante a redefinição da senha. " + err);
        process.exit(1);
    }
}

async function verificarSenha() {
    const admin = await Admin.findAll();
    let senha = readlineSync.question('Entre com a senha de admin: ', {
        hideEchoBack: true,
        caseSensitive: true
    });

    if (!compararHash(senha, admin[0].senha)) {
        console.log('\x1b[31m%s\x1b[0m', "Senha incorreta. ");
        process.exit(0);
    }
}

async function redefinirSenha() {
    const admin = await Admin.findAll();
    let confirm = false;
    let senha;

    do {
        senha = readlineSync.question("Defina uma senha. Ela deve ter entre 5 e 10 caracteres, sendo letras e/ou numeros: ", {hideEchoBack: true, caseSensitive: true});   
        
        while(!validarSenha(senha)) {
            senha = readlineSync.question("Defina uma senha valida! Ela deve ter entre 5 e 10 caracteres, sendo letras e/ou numeros: ", {hideEchoBack: true, caseSensitive: true});
        }

        let opcao = readlineSync.keyInSelect(['SIM, CONFIRMAR', 'NAO, VOLTAR'], 'Esta certo de sua senha? ', {cancel: 'CANCELAR OPERACAO'});

        switch (opcao) {
            case 0:
                confirm = true;
                break;
            case 1:
                break;
            default:
                console.log("OPERAÇÃO CANCELADA. ");
                process.exit(0);
        }

    } while (confirm === false);

    let senhaConf = readlineSync.question("Repita a sua senha: ", {hideEchoBack: true, caseSensitive: true});
    while(senhaConf !== senha) {
        senhaConf = readlineSync.question("Senhas nao conferem. Tente novamente: ", {hideEchoBack: true, caseSensitive: true});
    }

    let senhaHash = gerarHash(senha);
    await Admin.update({senha: senhaHash}, { where: {id_admin: admin[0].id_admin} });
}

function validarSenha(senha) {
    return RegExp(/^[a-zA-Z0-9]{5,10}$/).test(senha);
}

module.exports = async () => {
    try {
        let modo = await readlineSync.keyInSelect(['ESQUECI MINHA SENHA', 'QUERO TROCAR A MINHA SENHA'], 'O que voce deseja fazer?', {cancel: 'CANCELAR'});
        
        switch (modo) {
            case 0:
                await enviarSenhaPorEmail();
                break;
            case 1:
                break;
            default:
                console.log('\x1b[33m%s\x1b[0m', "Operação cancelada ou opção inválida. ");
                process.exit(0);
        }
        
        await verificarSenha();
        await redefinirSenha();
        console.log('\x1b[36m%s\x1b[0m', "Senha alterada com sucesso. ");
        process.exit(0);
    } catch (err) {
        console.log('\x1b[31m%s\x1b[0m', "Ocorreu um erro. " + err);
        process.exit(1);
    }
}