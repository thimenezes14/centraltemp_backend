require('../../../../database/sequelize');
const reg = require('../../../../logs/log');
const Perfil = require('../../../models/Perfil');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const DANGER = '\x1b[31m%s\x1b[0m', WARNING = '\x1b[33m%s\x1b[0m', SUCCESS = '\x1b[36m%s\x1b[0m';
const MAX_AGE = 120;

function gerarHash(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password,salt,null);
}

async function contarPerfis() {
    const numPerfis = await Perfil.count();
    return numPerfis;
}

module.exports.validarNome = nome => {
    return RegExp(/^[a-zà-úA-ZÀ-Ú]{1}[a-zà-ú A-ZÀ-Ú \-]{1,11}[a-zà-úA-ZÀ-Ú]{0,1}$/).test(nome);
}

module.exports.validarSenha = senha => {
    return RegExp(/^[0-9]{4}$/).test(senha);
}

module.exports.validarDataNasc = data_nasc => {
    if(moment().diff(moment(data_nasc, 'YYYY-MM-DD'), 'years') > MAX_AGE) {
        console.log(WARNING, "Data de nascimento é maior do que o limite. ");
        return false;
    }

    if(moment().isSameOrBefore(moment(data_nasc, 'YYYY-MM-DD'))) {
        console.log(WARNING, "Data de nascimento é menor do que o limite. ");
        return false;
    }

    return true;
}

module.exports.salvarPerfil = async perfil => {
    try {
        const numPerfis = await contarPerfis();
        if(numPerfis >= process.env.MAX_PERFIS) {
            console.log(DANGER, "Número máximo de perfis já atingido! ");
            return;
        }
        perfil.senha = await gerarHash(perfil.senha);
        perfil.avatar = 'default.png';
        perfil.sec_mode = true;
        await Perfil.create(perfil);
        console.log(SUCCESS, "Perfil criado com sucesso! ");
        await reg.registrarAcaoPerfil('salvar', perfil, true);
    } catch (err) {
        console.log(DANGER, "Erro ao criar perfil: " + err);
        return;
    }
}

module.exports.listarPerfis = async () => {
    try {
        const perfis = await Perfil.findAll({
            order: [
                ['nome', 'ASC']
            ]
        });
        return perfis;
    } catch (err) {
        console.log(DANGER, "Não foi possível listar os perfis: " + err);
    }
}

module.exports.excluirPerfil = async id => {
    try {
        await Perfil.destroy({where:{id_perfil: id}});
        console.log(SUCCESS, "Perfil excluído com sucesso! ");
        await reg.registrarAcaoPerfil('excluir', id, true);
    } catch (err) {
        console.log(DANGER, "Erro ao excluir perfil: " + err);
    }
}

module.exports.alterarSenha = async (novaSenha, id_perfil) => {
    try {
        if(!novaSenha) {
            console.log(WARNING, "Não há nenhuma senha para ser alterada. ");
            return;
        }

        const senha = await gerarHash(novaSenha);
        await Perfil.update({senha}, {where: {id_perfil}});
        console.log(SUCCESS, "Senha de perfil alterada com sucesso! ");
        await reg.registrarAcaoPerfil('senha', id_perfil, true);
    } catch (err) {
        console.log(DANGER, "Erro ao alterar senha de perfil: " + err);
    }
}