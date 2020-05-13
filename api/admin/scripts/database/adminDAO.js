require('../../../../database/sequelize');
const reg = require('../../../../logs/log');
const Admin = require('../../../models/Admin');
const bcrypt = require('bcrypt-nodejs');
const DANGER = '\x1b[31m%s\x1b[0m', WARNING = '\x1b[33m%s\x1b[0m', SUCCESS = '\x1b[36m%s\x1b[0m';

function gerarHash(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password,salt,null);
}

function compararHash(senha, senhaV) {
    return bcrypt.compareSync(senha, senhaV);
}

async function confirmar(senha) {
    let hasAdmin = await verificarSeHaAdmin();
    if(!hasAdmin) {
        console.log(DANGER, "Não existe nenhum administrador para realizar esta operação. ");
        return;
    }

    try {
        const admin = await Admin.findAll();
        return compararHash(senha, admin[0].senha);
    } catch (err) {
        throw Error("Erro: " + err);
    }
}

async function verificarSeHaAdmin() {
    try {
        const qtd_perfis = await Admin.count();
        if(qtd_perfis > 0) {
            console.log(WARNING, "Administrador já existe em base de dados... ");
            return true;
        }
        return false; 
    } catch (err) {
        console.log(DANGER, "Erro ao verificar admin. " + err);
        process.exit(1);
    }
}

module.exports.verificarAdmin = verificarSeHaAdmin;

module.exports.validarSenha = senha => {
    return RegExp(/^[a-zA-Z0-9]{6,20}$/).test(senha);
}

module.exports.novo = async dados => {
    try {
        let hasAdmin = await verificarSeHaAdmin();
        
        if(hasAdmin) {
            return false;
        }

        if(!this.validarSenha(dados.senha)) {
            console.log(DANGER, "Sua senha deve ter entre 6 e 20 caracteres, podendo ser letras e/ou números. ");
            return false;
        }
        
        let admin = {
            email: dados.email,
            senha: await gerarHash(dados.senha)
        };

        await Admin.create(admin);
        console.log(SUCCESS, "Um admin foi criado com sucesso! ");
        await reg.registrarAcaoAdmin('salvar');
        
    } catch (err) {
        console.log(DANGER, "Erro ao criar admin:  " + err);
        process.exit(1);
    }
}

module.exports.excluir = async senha => {
    try {
        let hasAdmin = await verificarSeHaAdmin();
        
        if(!hasAdmin) {
            console.log(WARNING, "Não existe administrador para ser excluído. ");
            return false;
        }

        let senhaOk = await confirmar(senha);
        if(senhaOk) {
            await Admin.destroy({where:{}});
            console.log(SUCCESS, "Administrador excluído com sucesso. ");
            await reg.registrarAcaoAdmin('excluir');
            return true;
        }
        console.log(DANGER, "Senha incorreta. ");
        return false;
    } catch (err) {
        throw Error("Erro: " + err);
    }
}

module.exports.getAdmin = async () => {
    const admin = await Admin.findAll();
    return admin[0];
}

module.exports.trocarSenha = async novaSenha => {
    if(!this.validarSenha(novaSenha)) {
        console.log(DANGER, "Sua senha deve ter entre 6 e 20 caracteres, podendo ser letras e/ou números. ");
        return false;
    }

    const admin = await Admin.findAll();
    await Admin.update({senha: await gerarHash(novaSenha)}, {where: {email: admin[0].email}});
    console.log(SUCCESS, "Senha alterada com sucesso! ");
    await reg.registrarAcaoAdmin('senha');
    return true;
}

module.exports.confirmarSenha = confirmar;
