const mongoose = require('mongoose');
module.exports = mongoose.connect(process.env.MONGOOSE_CONN_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("Mongoose Conectado."))
    .catch(err => console.log("Erro na conexão com o Mongoose. " + err))

//    mongoose.disconnect(() => console.log("pronto"));

