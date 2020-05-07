const readlineSync = require("readline-sync");
const bcrypt = require('bcrypt-nodejs');
const DEFAULT_PASSWORD = 'admin';
require('dotenv/config');

function gerarHash(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password,salt,null);
}

function compararHash(senha, senhaV) {
    return bcrypt.compareSync(senha, senhaV);
}

function checarSeExisteSenhaAdmin() {
    if(!RegExp(/^\$2[ayb]\$.{56}$/).test(process.env.ADMIN_PASS)) {
        let senhaPadrao = gerarHash(DEFAULT_PASSWORD);
        console.log("Utilize a senha 'admin' para o primeiro login. Não se esqueça de alterá-la posteriormente. Copie esta hash: \n", senhaPadrao);
        process.exit(0);
    }
}

function verificarSenha() {
    let senha = readlineSync.question('Entre com a senha de admin: ', {
        hideEchoBack: true
    });

    if(!compararHash(senha, process.env.ADMIN_PASS)) {
        console.log('\x1b[31m%s\x1b[0m', "Senha incorreta. ");
        process.exit(0);
    }
}

function redefinirSenha() {
    let novaSenha = readlineSync.question("Digite sua nova senha: ", {
        hideEchoBack: true
    });

    if(!verificarNovaSenha(novaSenha)) {
        console.log('\x1b[31m%s\x1b[0m', "Digite uma senha com pelo menos 4 caracteres sem a inclusão de acentos. ");
        process.exit(0);
    }

    let novaSenhaConf = readlineSync.question("Confirme a sua senha: ", {
        hideEchoBack: true
    });

    if(!verificarSenhasIguais(novaSenha, novaSenhaConf)) {
        console.log('\x1b[31m%s\x1b[0m', "Senhas não conferem. ");
        process.exit(0);
    }

    let hash = gerarHash(novaSenha);
    console.log("COPIE E COLE A SEGUINTE HASH NO ARQUIVO .ENV, PARÂMETRO ADMIN_PASS: \n", hash);
}

function verificarNovaSenha(senha) {
    return RegExp(/^[\wA-z0-9@!*_]{4,}$/).test(senha);
}

function verificarSenhasIguais(senha, confirmaSenha) {
    return senha === confirmaSenha;
}

module.exports = () => {
    try {
        checarSeExisteSenhaAdmin();
        verificarSenha();
        redefinirSenha();
        process.exit(0);
    } catch (err) {
        console.log('\x1b[31m%s\x1b[0m', "Ocorreu um erro. " + err);
        process.exit(1);
    }
}