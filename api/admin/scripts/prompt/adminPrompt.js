const adminDAO = require('../database/adminDAO');
const readlineSync = require('readline-sync');
const gerarSenhaAleatoria = require('../utils/generateRandomPassword');
const enviarEmailcomNovaSenha = require('../utils/sendEmail');
const TAM_SENHA_TEMP = 5;
const DANGER = '\x1b[31m%s\x1b[0m', WARNING = '\x1b[33m%s\x1b[0m', SUCCESS = '\x1b[36m%s\x1b[0m';

module.exports = {
    async criarAdmin() {
        function digitarEmail() {
            let email = readlineSync.questionEMail("Digite um e-mail valido: ", {limitMessage: 'Digite um e-mail valido!'});
            return email;
        }
        
        function digitarSenha() {
            let senha = readlineSync.question("Digite uma senha entre 6 e 20 caracteres, com numeros e/ou letras: ", {hideEchoBack: true});
            return senha;
        }

        try {
            let admin = {};
            admin.email = await digitarEmail();
            admin.senha = await digitarSenha();
            
            if(!adminDAO.validarSenha(admin.senha)) {
                console.log(DANGER, "Senha não atende aos critérios obrigatórios. ");
                return;
            }

            let senhaConf = readlineSync.question("Repita a sua senha: ", {hideEchoBack: true});
            if(senhaConf !== admin.senha) {
                console.log(DANGER, "Senhas não conferem. ");
                return;
            }

            await adminDAO.novo(admin);

        } catch (err) {
            console.log(err);
            process.exit(1);
        }
    },
    async excluirAdmin() {
        try {
            const admin = await adminDAO.getAdmin();
            if(admin) {
                let senha = readlineSync.question("Digite a senha para excluir o administrador: ", {hideEchoBack: true});
                await adminDAO.excluir(senha);
            } else {
                console.log(DANGER, "Não há administrador cadastrado no sistema.  ");
            }
        } catch (err) {
            console.log(DANGER, "Ocorreu um problema ao excluir o administrador:  " + err);
        }
    },
    async trocarSenha() {
        try {
            const admin = await adminDAO.getAdmin();
            console.log(WARNING, "Gerando código de confirmação... ");
            const codigoConfirmacao = await gerarSenhaAleatoria(TAM_SENHA_TEMP);
            await enviarEmailcomNovaSenha(codigoConfirmacao, admin.email, 'password');
            
            let codigoDigitado = readlineSync.question("Digite o codigo recebido: ");
            if(codigoDigitado !== codigoConfirmacao) {
                console.log(DANGER, "Codigo digitado não confere com código enviado por e-mail. ");
            } else {
                let senha = readlineSync.question("Redefina a senha (6 a 20 caracteres sendo letras e/ou numeros): ", {hideEchoBack: true});
                let senhaConf = readlineSync.question("Repita a senha: ", {hideEchoBack: true});
                if(senha === senhaConf) {
                    await adminDAO.trocarSenha(senha);
                } else {
                    console.log(DANGER, "Senhas não conferem. Atualização interrompida. ");
                }
            }  
        } catch (err) {
            console.log(DANGER, "Ocorreu um problema ao enviar o e-mail. " + err);
        }
    }
}