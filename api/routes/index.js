const app = require('express')();

app
.use(require('./perfis'))
.use(require('./banhos'))
.use(require('./preferencias'))

module.exports = app;