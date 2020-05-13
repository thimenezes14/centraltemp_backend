const promptFunctions = require('../prompt/adminPrompt');
const readlineSync = require('readline-sync');
const perfilMenu = require('./perfilMenu');
const reboot = require('../utils/reboot');
const DANGER = '\x1b[31m%s\x1b[0m', WARNING = '\x1b[33m%s\x1b[0m', SUCCESS = '\x1b[36m%s\x1b[0m';

module.exports = async () => {
    console.clear();
    console.log("Bem-vindo ao modo de administrador do sistema CentralTemp! ");
    console.log(WARNING, "Atenção: é altamente recomendado que nenhum usuário esteja utilizando o sistema. ");
    
    let opcao;

    do {
        const opcoesDescricao = ['CRIAR ADMINISTRADOR', 'EXCLUIR ADMINISTRADOR', 'ALTERAR SENHA', 'GERENCIAR PERFIS', 'REBOOT'];
        opcao = readlineSync.keyInSelect(opcoesDescricao, "Selecione uma opcao abaixo: ", { cancel: 'CANCELAR' });
 
        switch (opcao) {
            case 0:
                await promptFunctions.criarAdmin();
                break;
            case 1:
                await promptFunctions.excluirAdmin();
                break;
            case 2:
                await promptFunctions.trocarSenha();
                break;
            case 3:
                await perfilMenu();
                break;
            case 4:
                await reboot();
                break;
            case -1:
                console.log(WARNING, "Saindo...");
                process.exit(0);
            default:
                console.log(DANGER, "Nenhuma opção válida foi selecionada. ");
                break;
        }    
    } while (opcao !== -1);
    
}

