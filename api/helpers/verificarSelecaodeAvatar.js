const fs = require('fs');
const path = require('path');

const listarArquivosdeImagem = () => {
  try {
    const files = fs.readdirSync(path.resolve(__dirname, '..', 'avatar'))
    const images = files.filter(file => RegExp(/([a-zA-Z0-9\s_\\.\-\(\):])+(.png|.jpg|.jpeg)$/).test(file))
    const imagesData = images.map((image, index) => ({ id: index + 1, nome: image }))
    return imagesData
  } catch (err) {
    throw Error("Erro ao listar imagens: " + err)
  }
}

module.exports.listarArquivosdeImagem = listarArquivosdeImagem

module.exports.verificarNome = async avatar => {
  const images = (await listarArquivosdeImagem()).filter(img => img.nome === avatar).length
  return (images > 0)
}
