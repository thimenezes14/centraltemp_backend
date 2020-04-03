const app = require('express')();

app
.use(require('./perfis'))
.use(require('./banhos'))

module.exports = app;