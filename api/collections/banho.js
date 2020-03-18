const mongoose = require('mongoose');

const Banho = new mongoose.Schema({
    idUsuario: {
        type: String,
        required: true,
        match: /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/
    },
    temp_escolhida: {
        type: Number,
        required: true
    },
    temp_final: {
        type: Number,
        required: true
    },
    data_hora: {
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('banhos', Banho);