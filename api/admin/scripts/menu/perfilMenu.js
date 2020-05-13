const perfilFunctions = require('../prompt/perfilPrompt');
const readlineSync = require('readline-sync');
const DANGER = '\x1b[31m%s\x1b[0m', WARNING = '\x1b[33m%s\x1b[0m', SUCCESS = '\x1b[36m%s\x1b[0m';

module.exports = async () => {
    console.clear();
    console.log(SUCCESS, "Gerenciamento de perfis ");
    
    let opcao;

    do {
        const opcoesDescricao = ['CRIAR PERFIL', 'EXCLUIR PERFIL', 'ALTERAR PERFIL', 'LISTAR PERFIS'];
        opcao = readlineSync.keyInSelect(opcoesDescricao, "Selecione uma opcao abaixo: ", { cancel: 'VOLTAR' });
 
        switch (opcao) {
            case 0:
                await perfilFunctions.criarPerfil();
                break;
            case 1:
                await perfilFunctions.excluirPerfil();
                break;
            case 2:
                await perfilFunctions.trocarSenha();
                break;
            case 3:
                await perfilFunctions.listarPerfis(true);
                break;
            case -1:
                console.log(WARNING, "Retornando...");
                break;
            default:
                console.log(DANGER, "Nenhuma opção válida foi selecionada. ");
                break;
        }    
    } while (opcao !== -1);
    
}

