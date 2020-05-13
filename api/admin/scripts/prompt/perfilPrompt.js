const perfilDAO = require('../database/perfilDAO');
const adminDAO = require('../database/adminDAO');
const readlineSync = require('readline-sync');
const readlineAccent = require('synchronous-user-input');
const moment = require('moment');
const gerarSenhaAleatoria = require('../utils/generateRandomPassword');
const enviarEmailcomNovaSenha = require('../utils/sendEmail');
const TAM_SENHA_TEMP = 5;
const DANGER = '\x1b[31m%s\x1b[0m', WARNING = '\x1b[33m%s\x1b[0m', SUCCESS = '\x1b[36m%s\x1b[0m';

function digitarSenha() {
    let senha = readlineSync.question("Digite uma senha numerica de 4 digitos: ", {hideEchoBack: true});
    return senha;
}

async function verificarSenha() {
    let senhaConf = readlineSync.question("Confirme a sua senha (admin): ", {hideEchoBack: true});
    let senhaOk = await adminDAO.confirmarSenha(senhaConf);
    return senhaOk;
}

module.exports = {
    async criarPerfil() {
        function digitarNome() {
            let nome = readlineAccent("Forneça um nome de 2 a 13 caracteres, com ou sem acentos e traços, sem a inclusão de outros caracteres especiais: ");
            console.log(nome);
            return nome;
        }

        function escolherSexo() {
            const opcao = readlineSync.keyInSelect(['MASCULINO', 'FEMININO'], "Escolha um sexo: ", {cancel: false});
            let sexo;

            switch(opcao) {
                case 0:
                    sexo = 'M';
                    break;
                case 1:
                    sexo = 'F';
                    break;
                default:
                    console.log(DANGER, "Ocorreu um erro ao selecionar o sexo. ");
                    process.exit(1);
            }

            return sexo;
        }

        function digitarDataNasc() {
            try {
                let data_nasc = readlineSync.question("Digite uma data de nascimento (formato dd/mm/yyyy): ");
                let date_birth = moment(data_nasc, 'DD/MM/YYYY').format('YYYY-MM-DD');
                if(!Date.parse(date_birth)) {
                    console.log(DANGER, "Erro ao validar data de nascimento... ");
                    process.exit(1);
                }
                return date_birth;
            } catch (err) {
                console.log(DANGER, "Erro ao digitar data de nascimento: " + err);
                process.exit(1);
            }
        }
        
        try {
            let perfil = {};
            perfil.nome = await digitarNome();
            
            if(!perfilDAO.validarNome(perfil.nome)) {
                console.log(DANGER, "O nome do perfil não atende aos critérios solicitados. ");
                return;
            }

            perfil.sexo = await escolherSexo();
            perfil.data_nasc = await digitarDataNasc();

            if(!perfilDAO.validarDataNasc(perfil.data_nasc)) {
                console.log(DANGER, "A data de nascimento não atende aos critérios solicitados (máx 120 anos, min 1 dia). ");
                return;
            }
            
            perfil.senha = await digitarSenha();

            if(!perfilDAO.validarSenha(perfil.senha)) {
                console.log(DANGER, "A senha não atende aos critérios solicitados. ");
                return;
            }
            
            let senhaVerificada = await verificarSenha();
            if(!senhaVerificada) {
                console.log(DANGER, "A senha do administrador está incorreta. ");
                return;
            }

            await perfilDAO.salvarPerfil(perfil);

        } catch (err) {
            console.log(err);
            process.exit(1);
        }
    },
    async excluirPerfil() {
        let perfis = await this.listarPerfis();
        
        if(perfis.length === 0) {
            console.log(WARNING, "Não existe nenhum perfil para ser excluído. ");
            return;
        }

        let perfilParaExcluir = readlineSync.keyInSelect(perfis.map(p => {
            return p.nome + " (" + p.id_perfil + ") - " + p.sexo + " - " + moment(p.data_nasc, 'YYYY-MM-DD').format('DD/MM/YYYY');
        }), "Selecione um perfil para excluir: ", {cancel: 'CANCELAR'});

        switch (perfilParaExcluir) {
            case -1:
                console.log(WARNING, "Operação cancelada. ");
                return;
            default:
                console.log("O perfil de " + perfis[perfilParaExcluir].nome + " será excluído.");
                break;
        }

        let senhaVerificada = await verificarSenha();
        if(!senhaVerificada) {
            console.log(DANGER, "A senha do administrador está incorreta. ");
            return;
        }

        await perfilDAO.excluirPerfil(perfis[perfilParaExcluir].id_perfil);

    },
    async listarPerfis(exibirLista) {
        const perfis = await perfilDAO.listarPerfis();
        console.log(SUCCESS, "Perfis:");
        
        if(exibirLista === true) {
            perfis.map(perfil => {
                console.log("\n+++++++++++++++++++");
                console.log("ID: " + perfil.id_perfil);
                console.log("Nome: " + perfil.nome);
                console.log("Sexo: " + perfil.sexo);
                console.log("Data Nasc: " + moment(perfil.data_nasc, 'YYYY-MM-DD').format('DD/MM/YYYY'));
            });
        }

        return perfis;
    },
    async trocarSenha() {
        let perfis = await this.listarPerfis();

        if(perfis.length === 0) {
            console.log(WARNING, "Não existe nenhum perfil para ser modificado. ");
            return;
        }

        let perfilParaAlterarSenha = readlineSync.keyInSelect(perfis.map(p => {
            return p.nome + " (" + p.id_perfil + ") - " + p.sexo + " - " + moment(p.data_nasc, 'YYYY-MM-DD').format('DD/MM/YYYY');
        }), "Selecione um perfil para excluir: ", {cancel: 'CANCELAR'});

        switch (perfilParaAlterarSenha) {
            case -1:
                console.log(WARNING, "Operação cancelada. ");
                return;
            default:
                console.log("O perfil de " + perfis[perfilParaAlterarSenha].nome + " será modificado.");
                break;
        }

        let senhaVerificada = await verificarSenha();
        if(!senhaVerificada) {
            console.log(DANGER, "A senha do administrador está incorreta. ");
            return;
        }

        let novaSenha = await digitarSenha();

        if(!perfilDAO.validarSenha(novaSenha)) {
            console.log(DANGER, "A senha não atende aos critérios solicitados. ");
            return;
        }

        let novaSenhaConf = readlineSync.question("Repita a senha: ", {hideEchoBack: true});

        if(novaSenha !== novaSenhaConf) {
            console.log(DANGER, "Senhas não conferem. ");
            return;
        }

        await perfilDAO.alterarSenha(novaSenha, perfis[perfilParaAlterarSenha].id_perfil);

    }
}