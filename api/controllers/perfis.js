const sequelize = require('sequelize');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const Perfil = require('../models/Perfil');
const Banho = require('../models/Banho');
const BanhoHist = require('../collections/banho');

const gerarHash = require('../helpers/hashing').hash;
const verificarHash = require('../helpers/hashing').compare;
const {verificarNome, listarArquivosdeImagem} = require('../helpers/verificarSelecaodeAvatar');
const verificarDatadeNascimento = require('../helpers/verificarDatadeNascimento');
const reg = require('../../logs/log');


module.exports = {
    async listar(req, res) {
        await Perfil.findAll({
            attributes: ['id_perfil', 'nome', 'avatar'],
            order: [
                ['nome', 'ASC']
            ]
        })
            .then(perfis => { return res.status(200).json(perfis) })
            .catch(err => { return res.status(500).send(`Erro: ${err}`) })
    },
    async cadastrar(req, res) {
        try {
            const { nome, sexo, data_nasc, senha, avatar } = req.body;
            const errors = validationResult(req);
         
            if (!errors.isEmpty()) {
                return res.status(422).send(errors.array().map(item => { return item.msg }));
            }

            if(!(await verificarDatadeNascimento(data_nasc))) {
                return res.status(422).send("Data de nascimento inválida. ");
            }

            if (!(await verificarNome(avatar))) {
                return res.status(422).send("Nenhuma imagem válida foi selecionada. ");
            }

            let hash = await gerarHash(senha);
            await Perfil.create({ nome, senha: hash, sexo, data_nasc, avatar });
            
            await reg.registrarAcaoPerfil('salvar', nome, false);
            return res.status(201).send();
        } catch (err) {
            return res.status(500).send(`Erro: ${err}`);
        }

    },
    async detalhar(req, res) {
        const { id } = req.params;
        const { token } = res.locals;

        if (!id)
            return res.status(400).send("ID para detalhamento não fornecido. ");

        if (id !== token.id)
            return res.status(403).send("O ID informado difere do informado no token. ");

        try {
            const perfil = await Perfil.findOne({
                attributes: ['id_perfil', 'nome', 'sexo', [sequelize.fn('to_char', sequelize.col('data_nasc'), 'dd/mm/YYYY'), 'data_nasc'], 'avatar', 'sec_mode'],
                include: [
                    { model: Banho, as: 'banho_ativo', attributes: ['id_banho', 'temp_escolhida'] }
                ],
                where: { id_perfil: id }
            });

            return res.status(200).json(perfil);
        } catch (err) {
            return res.status(500).send(`Erro: ${err}`);
        }

    },
    async autenticar(req, res) {
        const { id, senha } = req.body;

        if (!id || !senha)
            return res.status(400).send("ID e/ou Senha não fornecidos. ");

        await Perfil.findOne({
            attributes: ['id_perfil', 'senha', 'sec_mode'],
            where: { id_perfil: id }
        })
            .then(async perfil => {

                if (!perfil) {
                    return res.status(404).send("Este usuário foi excluído anteriormente e não pode ser usado. ");
                }

                await verificarHash(senha, perfil.senha, async (err, isMatch) => {
                    if (err || !isMatch)
                        return res.status(401).send("ID e/ou Senha inválidos. ");

                    const token = await jwt.sign({
                        id: perfil.id_perfil,
                        sec_mode: perfil.sec_mode
                    },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: "15m"
                        }
                    );

                    await reg.registrarAcaoPerfil('login', perfil.id_perfil, false);
                    return res.status(200).json({ token });
                })
            })
            .catch(err => { return res.status(500).send(`Erro: ${err}`) })
    },
    async atualizar(req, res) {
        const { nome, senha, avatar, sec_mode } = req.body;
        const { id } = req.params;
        const { token } = res.locals;

        if (!id)
            return res.status(400).send("ID não fornecido. ");

        if (id !== token.id)
            return res.status(403).send("O ID informado difere do informado no token. ");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send(errors.array().map(item => { return item.msg }));
        }

        let campos = { nome };

        if (senha) {
            campos.senha = await gerarHash(senha);
        }

        if (avatar) {
          if (!(await verificarNome(avatar))) {
            return res.status(422).send("Nenhuma imagem válida foi selecionada. ");
          } 
            campos.avatar = avatar;
        }

        if (typeof (sec_mode) !== 'undefined') {
            campos.sec_mode = sec_mode;
        }

        await Perfil.update(campos, { where: { id_perfil: id } })
            .then(async () => {
                await reg.registrarAcaoPerfil('alterar', id, false);
                return res.status(200).send();
            })
            .catch(err => { return res.status(500).send(`Erro: ${err}`) })

    },
    async excluir(req, res) {
        const { id } = req.params;
        const { token } = res.locals;

        if (!id)
            return res.status(400).send("ID não informado para exclusão. ");

        if (id !== token.id)
            return res.status(403).send("O ID informado difere do informado no token. ");

        const t = await Perfil.sequelize.transaction({ autocommit: false });

        try {
            await Perfil.destroy({ where: { id_perfil: id } }, { transaction: t });
            await BanhoHist.deleteMany({ id_perfil: id });
            await t.commit();
            await reg.registrarAcaoPerfil('excluir', id, false);
            return res.status(200).send();
        } catch (err) {
            await t.rollback();
            return res.status(500).send(`Erro: ${err}`)
        }
    },
    async excluirHistorico(req, res) {
        const { id } = req.params;
        const { token } = res.locals;

        if (!id)
            return res.status(400).send("ID não informado para exclusão. ");

        if (id !== token.id)
            return res.status(403).send("O ID informado difere do informado no token. ");

        await BanhoHist.deleteMany({ id_perfil: id })
            .then(async () => {
                await reg.registrarAcaoBanho('excluir', id, false);
                return res.status(200).send();
            })
            .catch(err => {
                return res.status(500).send(err);
            })
    },
    async listarImagensParaPerfil(req, res) {
        try {
            const images = await listarArquivosdeImagem();
            return res.status(200).json(images);
        } catch (err) {
            return res.status(500).send(err);
        }
    }
}