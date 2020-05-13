const moment = require('moment');
const fs = require('fs');
const path = require('path');

function getTimestamp() {
    const date = moment().format('DD/MM/YYYY');
    const time = moment().format('HH:mm:ss');
    return ("[" + date + "-" + time + "]: ");
}

module.exports = {
    async registrarAcaoPerfil(acao, perfil, admin) {
        let action = '';
        let perfil_dados = '';
        let perfilIdentificacao = 'perfil com ';

        if(typeof perfil === 'object') {
            perfil_dados = {
                id_perfil : perfil.id_perfil || null,
                nome: perfil.nome || null
            };
            perfilIdentificacao += perfil_dados.id_perfil ? ('ID [' + perfil_dados.id_perfil + '] ' ): '';
            perfilIdentificacao += perfil_dados.nome ? ('NOME [' + perfil_dados.nome + '] ' ): '';
        } else {
           perfil_dados = perfil; 
           const rgx = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/;
           perfilIdentificacao += rgx.test(perfil) ? 'ID ' : 'NOME ';
           perfilIdentificacao += '[' + perfil + '] ';
        }
        
        let foiAdmin = '';

        switch (acao) {
            case 'salvar':
                action = 'CRIADO ';
                break;
            case 'excluir':
                action = 'EXCLUÍDO ';
                break;
            case 'senha':
                action = 'SENHA ALTERADA de ';
                break;
            case 'alterar':
                action = 'DADOS ALTERADOS de ';
                break;
            case 'login':
                action = 'LOGIN de ';
                break;
            case 'logout':
                action = 'LOGOUT de ';
                break;
            default:
                return;
        }

        if (admin === true) {
            foiAdmin = 'pelo administrador';
        }

        let timestamp = getTimestamp();
        let log = timestamp + action + perfilIdentificacao + foiAdmin + '\n';
        console.log(log);
        await fs.appendFileSync(path.resolve(__dirname, '.log'), log);
    },
    async registrarAcaoBanho(acao, id) {
        let action = '';
        let perfilIdentificacao = id ? ': perfil com id [' + id + '] ' : ' manualmente ';
        
        switch (acao) {
            case 'registrar':
                action = 'REGISTRADO ';  
                break;
            case 'salvar':
                action = 'HISTORICO SALVO de ';
                break;
            case 'excluir':
                action = 'EXCLUÍDO HISTÓRICO de ';
                break;
            default:
                return;
        }

        let timestamp = await getTimestamp();
        let log = timestamp + action + "banho" + perfilIdentificacao + '\n';
        console.log(log);
        await fs.appendFileSync(path.resolve(__dirname, '.log'), log);
    },
    async registrarAcaoAdmin(acao) {
        let action = '';

        switch (acao) {
            case 'salvar':
                action = 'CRIADO ';
                break;
            case 'excluir':
                action = 'EXCLUÍDO ';
                break;
            case 'senha':
                action = 'SENHA ALTERADA de ';
                break;
            default:
                return;
        }

        let timestamp = await getTimestamp();
        let log = timestamp + action + "admin" + '\n';
        console.log(log);
        await fs.appendFileSync(path.resolve(__dirname, '.log'), log);
    },
    async reboot() {
        let timestamp = await getTimestamp();
        let log = timestamp + "Sistema Redefinido." + '\n';
        console.log(log);
        await fs.appendFileSync(path.resolve(__dirname, '.log'), log);
    }
}

