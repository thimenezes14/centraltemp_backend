require('dotenv/config');
require('./database/mongoose');
require('./database/sequelize');

const app = require('./api/config/server');

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Aplicação iniciada na porta ${process.env.SERVER_PORT}!`);
});
