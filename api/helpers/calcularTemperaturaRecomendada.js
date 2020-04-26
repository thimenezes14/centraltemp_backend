const MLR = require('ml-regression-multivariate-linear');
const genstats = require('genstats');

const fator_de_variacao = require('./fatordevariacao');
const SENSOR_TEMPERATURA_FAIXA = {min: 0, max: 50};
const PONTO_MEDIO = {menos_um: 40, zero: 37, mais_um: 34};
const MIN_BANHOS = 10;

const CLASSIFICACAO_IDEAL = 1, CLASSIFICACAO_BOM = 2;
const MAX_DURACAO_IDEAL = 300, MAX_DURACAO_TOLERAVEL = 600;

function obterFatorDeVariacao(temperatura_ambiente) {
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
        let classificacao_duracao_banho; 
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

        if(dado.duracao_seg <= MAX_DURACAO_IDEAL) {
            classificacao_duracao_banho = 1;
        } else if(dado.duracao_seg <= MAX_DURACAO_TOLERAVEL) {
            classificacao_duracao_banho = 2;
        } else {
            classificacao_duracao_banho = 3;
        }
        
        return {
            temp_ambiente: dado.temp_ambiente,
            temp_final: y,
            fator,
            limites,
            classificacao_temperatura: T,
            classificacao_duracao: classificacao_duracao_banho
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
    
    const filtro = historico.filter(h => (h.classificacao_temperatura === CLASSIFICACAO_IDEAL || h.classificacao_temperatura === CLASSIFICACAO_BOM));

    if(filtro.filter(f => f.fator === fat_var_rec.fator).length >= MIN_BANHOS) {

        filtro.map(f => {
            x.push([f.temp_ambiente, Number(f.fator)]);
        });

        y.push(...filtro.map(f => [f.temp_final]));
    }
 
    const mlr = await new MLR(x, y, { intercept: true });
    console.log(mlr.toJSON());
    
    let temperatura_recomendada = await Math.round(mlr.predict([temperatura, Number(fat_var_rec.fator)]));
    console.log(temperatura_recomendada);
    
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