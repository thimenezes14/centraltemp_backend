const express = require('express');
const app = express();
const cors = require('cors')
const morgan = require('morgan');
const routes = require('../routes');
const path = require('path');
const rateLimit = require("express-rate-limit");

let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
  }

app.use(cors(corsOptions))
app.use('/imagens', express.static(path.resolve(__dirname, '..', 'avatar')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
const limiter = rateLimit({
    windowMs: process.env.WINDOW_MINUTES * 60 * 1000,
    max: process.env.MAX_REQUESTS_PER_WINDOW,
    message: "Limite de requisições atingido. Por favor, tente novamente em 10 minutos."
});
app.use(limiter);
app.use(routes);

module.exports = app;