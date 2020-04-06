const MLR = require('ml-regression-multivariate-linear');
const genstats = require('genstats');

const SENSOR_TEMPERATURA_FAIXA = {min: 0, max: 50};
const PONTO_MEDIO = {menos_um: 40, zero: 37, mais_um: 34};
const MIN_BANHOS = 10;

function obterFatorDeVariacao(temperatura_ambiente) {

    const fator_de_variacao = [
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

    if(!isNaN(temperatura_ambiente))
        return fator_de_variacao.filter(f => (temperatura_ambiente >= f.intervalo.min) && (temperatura_ambiente <= f.intervalo.max))[0];
    else {
        return fator_de_variacao.map(f => f.intervalo);
    }
}

function normalizarTemperatura(temperatura_ambiente) {

    if(isNaN(temperatura_ambiente)) {
        throw new Error("Parâmetro informado não corresponde a um número. ");
    }

    let temperatura;

    if (temperatura_ambiente < SENSOR_TEMPERATURA_FAIXA.min) {
        temperatura = SENSOR_TEMPERATURA_FAIXA.min;
    } else if (temperatura_ambiente > SENSOR_TEMPERATURA_FAIXA.max) {
        temperatura = SENSOR_TEMPERATURA_FAIXA.max;
    } else {
        temperatura = temperatura_ambiente;
    }

    return temperatura;
}

module.exports.classificar = async dados => {
  
    if (!Array.isArray(dados)) {
        throw new Error("Dados informados não são array. ");
    }

    let historico = await dados.map(dado => {
        const {fator, limites} = obterFatorDeVariacao(dado.temp_ambiente);
        let x; 
        switch (fator) {
            case '-1':
                x = PONTO_MEDIO.menos_um;
                break;
            case '0':
                x = PONTO_MEDIO.zero;
                break;
            case '1':
                x = PONTO_MEDIO.mais_um;
                break;
            default:
                break;
        }
        
        const y = dado.temp_final;
        let T;
        x = (x > y) ? x += 1 : (x < y) ? x -= 1 : x;
        let d = Math.abs(y - x);

        T = Math.floor(d / 3) + 1;
        
        return {
            temp_ambiente: dado.temp_ambiente,
            temp_final: y,
            fator,
            limites,
            classificacao: T
        }
    });
    
    return historico;

}

module.exports.recomendar = async (dados, temp_ambiente) => {

    if (!Array.isArray(dados)) {
        throw new Error("Dados informados não são array. ");
    }

    if (isNaN(temp_ambiente)) {
        throw new Error("Temperatura ambiente não informada ou não é um número. ");
    }
    
    const temperatura = normalizarTemperatura(temp_ambiente);
    const historico = await this.classificar(dados);
    const intervalos = obterFatorDeVariacao();
    const fat_var_rec = obterFatorDeVariacao(temperatura);

    let x = [
                [Math.ceil((intervalos[0].min + intervalos[0].max) / 2), -1], 
                [Math.ceil((intervalos[1].min + intervalos[1].max) / 2), 0], 
                [Math.ceil((intervalos[2].min + intervalos[2].max) / 2), 1]
            ];

    let y = [[PONTO_MEDIO.menos_um], [PONTO_MEDIO.zero], [PONTO_MEDIO.mais_um]];
    
    const filtro = historico.filter(h => (h.classificacao === 1 || h.classificacao === 2));

    if(filtro.filter(f => f.fator === fat_var_rec.fator).length >= MIN_BANHOS) {

        filtro.map(f => {
            x.push([f.temp_ambiente, Number(f.fator)]);
        });

        y.push(...filtro.map(f => [f.temp_final]));
    }
 
    const mlr = await new MLR(x, y, { intercept: true });
    
    let temperatura_recomendada = await Math.round(mlr.predict([temperatura, Number(fat_var_rec.fator)]));
    
    if(temperatura_recomendada > fat_var_rec.limites.max) {
        temperatura_recomendada = fat_var_rec.limites.max;
    }

    if(temperatura_recomendada < fat_var_rec.limites.min) {
        temperatura_recomendada = fat_var_rec.limites.min;
    }

    const x_teste = x.map(valor => valor[0]);
    const y_teste = y.map(valor => valor[0]);

    const resultado = {
        limites: fat_var_rec.limites,
        precisao_aproximada: Number((Math.abs(100 * genstats.correlation(x_teste, y_teste))).toFixed(1)),
        temperatura_recomendada,
    }

    return resultado;

}