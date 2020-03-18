const express = require('express');
const app = express();
const morgan = require('morgan');
const routes = require('../routes');
const path = require('path');

app.use('/imagens', express.static(path.resolve(__dirname, '..', 'avatar')));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    next();
});
app.use(routes);

module.exports = app;