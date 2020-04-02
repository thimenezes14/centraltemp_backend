const MLR = require('ml-regression-multivariate-linear');

/*
    Algoritmo de Recomendação de Temperatura por regressão linear.

    Funcionamento:

    1 - Obtém massa de dados do banho.
    2 - Se massa obtiver mais do que 10 banhos, utilizá-la como parâmetro de cálculo.
    3 - Se massa não obtiver mais que 10 banhos, utilizar recomendação genérica.
    4 - Retorna a temperatura recomendada.

*/

const MIN_BANHOS = 10;
const TEMP_AMB_MIN = 0, TEMP_AMB_MAX = 40;
const TEMP_BANHO_IDEAL = 37;
const TEMP_CHUV_MAX = 44;
const TEMP_AMBIENTE_AMENO = {min: 20, max: 28};
const LIM_FATOR_MENOS_1 = {min: 36, max: 44}, LIM_FATOR_ZERO = {min: 33, max: 41}, LIM_FATOR_MAIS_1 = {min: 30, max: 38};

module.exports = async (dados, temp_ambiente) => {
    
    if(!Array.isArray(dados)) {
        throw new Error("Dados informados não são array. ");
    }

    if(isNaN(temp_ambiente)) {
        throw new Error("Temperatura ambiente não informada. ");
    }

    let temperatura;

    if(temp_ambiente < TEMP_AMB_MIN) {
        temperatura = TEMP_AMB_MIN;
    } else if(temp_ambiente > TEMP_AMB_MAX) {
        temperatura = TEMP_AMB_MAX;
    } else {
        temperatura = temp_ambiente;
    }

    let limites = {};
    const {min, max} = TEMP_AMBIENTE_AMENO;
    let x = [[TEMP_AMB_MIN], [(min + max) / 2]];
    let y = [[TEMP_CHUV_MAX], [TEMP_BANHO_IDEAL]];
    
    if(dados.length > MIN_BANHOS) {
        
        let filtro;
        if(temperatura < TEMP_AMBIENTE_AMENO.min) {
            filtro = await dados.filter(dado => dado.temp_final >= LIM_FATOR_MENOS_1.min && dado.temp_final <= LIM_FATOR_MENOS_1.max );
            limites = {...LIM_FATOR_MENOS_1};
        } else if(temperatura < TEMP_AMBIENTE_AMENO.max) {
            filtro = await dados.filter(dado => dado.temp_final >= LIM_FATOR_ZERO.min && dado.temp_final <= LIM_FATOR_ZERO.max );
            limites = {...LIM_FATOR_ZERO};
        } else {
            filtro = await dados.filter(dado => dado.temp_final >= LIM_FATOR_MAIS_1.min && dado.temp_final <= LIM_FATOR_MAIS_1.max );
            limites = {...LIM_FATOR_MAIS_1};
        }

        if(filtro && filtro.length > MIN_BANHOS) {
            x = await filtro.map(dado => [dado.temp_ambiente]);
            y = await filtro.map(dado => [dado.temp_final]);
        }
    }

    const mlr = await new MLR(x, y, {intercept: true});
    //console.log(mlr.toJSON().summary.variables);
    const temperatura_recomendada = await Math.round(mlr.predict([temperatura]));

    return {limites,temperatura_recomendada};

}