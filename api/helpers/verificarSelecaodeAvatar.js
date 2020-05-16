const fs = require('fs');
const path = require('path');

async function listarArquivosdeImagem() {
    try {
        const files = await fs.readdirSync(path.resolve(__dirname, '..', 'avatar'));
        const images = await files.filter(image => RegExp(/([a-zA-Z0-9\s_\\.\-\(\):])+(.png|.jpg|.jpeg)$/).test(image));
        return images;
    } catch (err) {
        throw Error("Erro ao listar imagens: " + err);
    }
}

module.exports = async avatar => {
    const images = (await listarArquivosdeImagem()).filter(img => img === avatar).length;
    return (images > 0);
}