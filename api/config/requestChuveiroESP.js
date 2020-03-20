require('dotenv/config');
const axios = require('axios').default;

const config = axios.create({
    baseURL: process.env.ESP_HOST_TEST
});

module.exports = config;