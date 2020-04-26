const SENSOR_TEMPERATURA_FAIXA = {min: 0, max: 50};

module.exports = [
    {
        fator: '-1',
        intervalo: { min: SENSOR_TEMPERATURA_FAIXA.min, max: 25 },
        limites: {min: 36, max: 44}
    },
    {
        fator: '0',
        intervalo: { min: 26, max: 34 },
        limites: {min: 33, max: 41}
    },
    {
        fator: '1',
        intervalo: { min: 35, max: SENSOR_TEMPERATURA_FAIXA.max },
        limites: {min: 30, max: 38}
    }
];