const MLR = require('ml-regression-multivariate-linear');
const genstats = require('genstats');
const csvToJson = require('csv-file-to-json');
const path = require('path');

const fator_de_variacao = require('../api/helpers/fatordevariacao');
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

const classificar = async dados => {
  
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
            classificacao_temperatura: T
        }
    });
    
    return historico;

}

const recomendar = async (dados, temp_ambiente) => {

    if (!Array.isArray(dados)) {
        throw new Error("Dados informados não são array. ");
    }

    if (isNaN(temp_ambiente)) {
        throw new Error("Temperatura ambiente não informada ou não é um número. ");
    }
    
    const temperatura = normalizarTemperatura(temp_ambiente);
    const historico = await classificar(dados);
    const intervalos = obterFatorDeVariacao();
    const fat_var_rec = obterFatorDeVariacao(temperatura);

    let x = [
                [Math.ceil((intervalos[0].min + intervalos[0].max) / 2)], 
                [Math.ceil((intervalos[1].min + intervalos[1].max) / 2)], 
                [Math.ceil((intervalos[2].min + intervalos[2].max) / 2)]
            ];

    let y = [[PONTO_MEDIO.menos_um], [PONTO_MEDIO.zero], [PONTO_MEDIO.mais_um]];
    
    const filtro_classificacao = historico.filter(h => (h.classificacao_temperatura === CLASSIFICACAO_IDEAL || h.classificacao_temperatura === CLASSIFICACAO_BOM));
    const filtro_recomendacao = filtro_classificacao.filter(f => f.fator === fat_var_rec.fator);
    
    if(filtro_recomendacao.length >= MIN_BANHOS) {
        x.push(...filtro_recomendacao.map(f => [f.temp_ambiente]));
        y.push(...filtro_recomendacao.map(f => [f.temp_final]));
    }

    const mlr = await new MLR(x, y, { intercept: true });
    let temperatura_recomendada = await Math.round(mlr.predict([temperatura]));
    
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

const temperatura_ambiente_simulada = Math.floor(Math.random() * 25);
const jsonFileFromCSV = csvToJson({ filePath: path.resolve("./tests/dados_thiago.csv"), hasHeader: true, separator: ';' });

async function normalizarDados(dados) {
    const dadosNormalizados = await dados.map(dado => {
        return {
            temp_ambiente: Number(dado.temp_ambiente),
            temp_final: Number(dado.temp_final)
        }
    })
    return dadosNormalizados;
}

async function main() {
    const dados = await normalizarDados(jsonFileFromCSV);
    console.log(temperatura_ambiente_simulada);
    console.log(await recomendar(dados, temperatura_ambiente_simulada));
}

main();
