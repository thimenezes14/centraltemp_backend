const mongoose = require('mongoose');

const Banho = new mongoose.Schema({
    id_perfil: {
        type: String,
        required: true,
        match: /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/
    },
    temp_ambiente: {
        type: Number,
        required: true
    },
    temp_escolhida: {
        type: Number,
        required: true
    },
    temp_final: {
        type: Number,
        required: true
    },
    duracao_seg: {
        type: Number,
        required: true
    },
    data_hora_insercao: {
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('banhos', Banho);