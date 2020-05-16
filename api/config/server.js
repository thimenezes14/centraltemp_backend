const express = require('express');
const app = express();
const morgan = require('morgan');
const routes = require('../routes');
const path = require('path');
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: process.env.WINDOW_MINUTES * 60 * 1000,
    max: process.env.MAX_REQUESTS_PER_WINDOW,
    message: "Limite de requisições atingido. Por favor, tente novamente em 10 minutos."
});

app.use(limiter);
app.use('/imagens', express.static(path.resolve(__dirname, '..', 'avatar')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    next();
});
app.use(routes);

module.exports = app;