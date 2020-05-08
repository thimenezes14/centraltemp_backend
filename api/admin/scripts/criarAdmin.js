const readlineSync = require('readline-sync');
const bcrypt = require('bcrypt-nodejs');
require('../../../database/sequelize');
const Admin = require('../../models/Admin');
const enviarEmail = require('./sendEmail');
const gerarSenhaAleatoria = require('./generateRandomPassword');

function gerarHash(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password,salt,null);
}

async function verificarSeHaAdmin() {
    try {
        const qtd_perfis = await Admin.count();
        if(qtd_perfis > 0) {
            console.log("Já existe um administrador no sistema. ");
            return true;
        }
        return false; 
    } catch (err) {
        console.log("Erro ao verificar admin. " + err);
        process.exit(1);
    }
    
}

function validarSenha(senha) {
    return RegExp(/^[a-zA-Z0-9]{5,10}$/).test(senha);
}

async function inserirDados() {
    let admin = {};
    let confirm = false;

    do {
        admin.email = readlineSync.questionEMail("Defina um e-mail valido para sua conta: ", {limitMessage: "Por favor, forneca um e-mail valido! "});
        let opcao = readlineSync.keyInSelect(['SIM, CONFIRMAR', 'NAO, VOLTAR'], 'Esta certo de seu e-mail? ', {cancel: 'CANCELAR OPERACAO'});

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
    
    do {
        confirm = false;
        admin.senha = readlineSync.question("Defina uma senha. Ela deve ter entre 5 e 10 caracteres, sendo letras e/ou numeros: ", {hideEchoBack: true, caseSensitive: true});
                
        while(!validarSenha(admin.senha)) {
            admin.senha = readlineSync.question("Defina uma senha valida! Ela deve ter entre 5 e 10 caracteres, sendo letras e/ou numeros: ", {hideEchoBack: true, caseSensitive: true});
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
    
    while(senhaConf !== admin.senha) {
        senhaConf = readlineSync.question("Senhas nao conferem. Tente novamente: ", {hideEchoBack: true, caseSensitive: true});
    }

    admin.senha = gerarHash(admin.senha);

    return admin;

}

async function salvarNaBaseDeDados(dados) {
    try {
        const confirmacaoCadastro = await gerarSenhaAleatoria(5);
        await enviarEmail(confirmacaoCadastro, dados.email, 'confirmation');
        let confirmacao = readlineSync.question("Digite os caracteres enviados por e-mail: ");
        
        while(confirmacao !== confirmacaoCadastro) {
            confirmacao = readlineSync.question("Desculpe, mas os caracteres estao incorretos. Tente novamente: ");
        }

        await Admin.create(dados);
        console.log("Admin criado com sucesso! ");
        process.exit(0);  
    } catch (err) {
        console.log("Ocorreu um erro ao salvar admin na base de dados. " + err);
        process.exit(1);
    }
}

module.exports.verificarSeHaAdmin = verificarSeHaAdmin;
module.exports.cadastrar = async() => {
    const hasAdmin = await verificarSeHaAdmin();
    if(!hasAdmin) {
        let dados = await inserirDados();
        await salvarNaBaseDeDados(dados);
    }
}